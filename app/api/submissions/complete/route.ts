import { adminClient, bucketName, jsonError, sameOrigin, text, verifySubmissionToken } from "../../_shared";

type FileRecord = { storage_path?: unknown; original_filename?: unknown; mime_type?: unknown; size_bytes?: unknown; width?: unknown; height?: unknown; sort_order?: unknown; photo_role?: unknown };

function escapeHtml(value: unknown) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) throw new Error("Email delivery is not configured.");
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to], subject, html, reply_to: replyTo }) });
  if (!response.ok) throw new Error("Email delivery was delayed.");
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return jsonError(new Error("This request did not come from the website."), 403);
    const body = await request.json() as { submission_id?: unknown; submission_token?: unknown; files?: FileRecord[] };
    const submissionId = text(body.submission_id, 60);
    if (!submissionId || !(await verifySubmissionToken(submissionId, text(body.submission_token, 512)))) return jsonError(new Error("The secure submission session has expired. Please try again."), 403);
    const files = Array.isArray(body.files) ? body.files : [];
    if (files.length < 3 || files.length > 5) return jsonError(new Error("Please upload 3–5 photos."));
    const supabase = adminClient();
    const { data: stored, error: listError } = await supabase.storage.from(bucketName).list(`submissions/${submissionId}`, { limit: 10 });
    if (listError) throw listError;
    const storedPaths = new Set((stored || []).map((file) => `submissions/${submissionId}/${file.name}`));
    const normalized = files.map((file, index) => {
      const path = text(file.storage_path, 500);
      if (!path.startsWith(`submissions/${submissionId}/`) || !storedPaths.has(path)) throw new Error("One or more uploaded photos could not be verified.");
      return {
        submission_id: submissionId,
        storage_path: path,
        original_filename: text(file.original_filename, 255),
        mime_type: "image/webp",
        size_bytes: Math.max(0, Number(file.size_bytes) || 0),
        width: Math.max(1, Number(file.width) || 1),
        height: Math.max(1, Number(file.height) || 1),
        sort_order: index,
        photo_role: ["face", "action", "uniform", "additional"].includes(text(file.photo_role, 20)) ? text(file.photo_role, 20) : "additional",
      };
    });
    const { error: fileError } = await supabase.from("submission_files").upsert(normalized, { onConflict: "storage_path" });
    if (fileError) throw fileError;
    const { data: submission, error: updateError } = await supabase.from("submissions").update({ status: "submitted", photo_count: normalized.length, updated_at: new Date().toISOString() }).eq("id", submissionId).eq("status", "uploading").select("*").maybeSingle();
    if (updateError) throw updateError;
    if (!submission) return Response.json({ requestId: submissionId, alreadySubmitted: true });

    let emailDelayed = false;
    try {
      const customerFirstName = escapeHtml(String(submission.customer_name || "there").split(" ")[0]);
      const athleteName = `${escapeHtml(submission.athlete_first_name)} ${escapeHtml(submission.athlete_last_name)}`;
      await sendEmail(submission.customer_email, `We received your athlete photos — Request ${submissionId}`, `<p>Hi ${customerFirstName},</p><p>We received your request for <strong>${athleteName}</strong>.</p><p>We will personally review the photos, sport details, and preferred style. You can expect a personal reply within 24 hours. If the photos are suitable, we will confirm the package and send a secure payment link. No payment is required until then.</p><h3>Request summary</h3><p>Request ID: ${escapeHtml(submissionId)}<br>Sport: ${escapeHtml(submission.sport)}<br>Preferred style: ${escapeHtml(submission.style)}<br>Package interest: ${escapeHtml(submission.package_interest)}<br>Add-on interest: ${escapeHtml(submission.add_on_interest || "None selected")}</p><p>For a physical package, your shipping address will be collected securely during payment. The approved poster and card pack may arrive separately.</p><p>If you notice an important mistake, reply directly to this email and include the Request ID.</p><p>Thanks,<br>${escapeHtml(process.env.NEXT_PUBLIC_OWNER_NAME || "The Game Day Edition team")}</p><p><small>Your uploaded photos remain private and will not be published without separate permission.</small></p>`);
      const signedLinks = [];
      for (const file of normalized) {
        const { data } = await supabase.storage.from(bucketName).createSignedUrl(file.storage_path, 24 * 60 * 60);
        if (data?.signedUrl) signedLinks.push(data.signedUrl);
      }
      if (process.env.OWNER_NOTIFICATION_EMAIL) await sendEmail(process.env.OWNER_NOTIFICATION_EMAIL, `New athlete request: ${athleteName} · ${escapeHtml(submission.sport)} · ${escapeHtml(submission.package_interest)}`, `<p><strong>Request ID:</strong> ${escapeHtml(submissionId)}</p><p><strong>Customer:</strong> ${escapeHtml(submission.customer_name)} · ${escapeHtml(submission.customer_email)}</p><p><strong>Athlete:</strong> ${athleteName} · #${escapeHtml(submission.jersey_number)} · ${escapeHtml(submission.position_event)}</p><p><strong>Sport/style:</strong> ${escapeHtml(submission.sport)} · ${escapeHtml(submission.style)}</p><p><strong>Package/add-on:</strong> ${escapeHtml(submission.package_interest)} · ${escapeHtml(submission.add_on_interest || "None")}</p><p><strong>Team/colors:</strong> ${escapeHtml(submission.team_name)} · ${escapeHtml(submission.primary_color)} / ${escapeHtml(submission.secondary_color)}</p><p><strong>Notes:</strong> ${escapeHtml(submission.notes)}</p><p><strong>Photo count:</strong> ${normalized.length}</p><p>${signedLinks.map((link, index) => `<a href="${escapeHtml(link)}">Private photo ${index + 1}</a>`).join("<br>")}</p><p><a href="mailto:${escapeHtml(submission.customer_email)}?subject=${encodeURIComponent(`Your athlete project ${submissionId}`)}">Reply to customer</a></p>`, submission.customer_email);
    } catch (error) {
      emailDelayed = true;
      console.error("Submission stored, but email delivery failed", error instanceof Error ? error.message : "unknown email error");
    }
    return Response.json({ requestId: submissionId, emailDelayed });
  } catch (error) {
    return jsonError(error, /configured/.test(error instanceof Error ? error.message : "") ? 503 : 400);
  }
}
