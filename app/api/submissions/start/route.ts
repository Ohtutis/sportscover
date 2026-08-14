import { adminClient, bucketName, createSubmissionToken, jsonError, rateLimited, sameOrigin, text, verifyTurnstile } from "../../_shared";

const requiredFields = ["order_type", "sport", "package_interest", "style", "athlete_first_name", "athlete_last_name", "jersey_number", "position_event", "team_name", "primary_color", "secondary_color", "customer_name", "customer_email", "country"];

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return jsonError(new Error("This request did not come from the website."), 403);
    if (await rateLimited(request)) return jsonError(new Error("Too many requests. Please wait a few minutes and try again."), 429);
    const body = await request.json() as Record<string, unknown>;
    if (!(await verifyTurnstile(text(body.turnstile_token, 2048), request))) return jsonError(new Error("The security check could not be verified."), 403);
    for (const field of requiredFields) if (!text(body[field], 300)) return jsonError(new Error(`Please complete ${field.replaceAll("_", " ")}.`));
    const orderType = text(body.order_type, 40);
    if (!["Individual Athlete", "Team Order"].includes(orderType)) return jsonError(new Error("Please choose a valid order type."));
    if (text(body.country, 80) === "United States" && !text(body.state, 80)) return jsonError(new Error("Please enter the state."));
    const teamSize = Number(body.team_size);
    if (orderType === "Team Order" && (!Number.isInteger(teamSize) || teamSize < 2 || teamSize > 500)) return jsonError(new Error("Please enter a valid team size between 2 and 500."));
    if (!/^\S+@\S+\.\S+$/.test(text(body.customer_email, 254))) return jsonError(new Error("Please enter a valid email address."));
    if (body.guardian_consent !== true || body.photo_rights_consent !== true || body.terms_consent !== true) {
      return jsonError(new Error("Guardian permission, photo rights, and the Terms and Privacy Policy must be confirmed."));
    }
    const fileCount = Number(body.file_count);
    if (!Number.isInteger(fileCount) || fileCount < 3 || fileCount > 5) return jsonError(new Error("Please upload 3–5 photos."));
    const idempotencyKey = text(body.idempotency_key, 100);
    if (!idempotencyKey) return jsonError(new Error("The request is missing its duplicate-prevention key."));

    const supabase = adminClient();
    const record = {
      status: "uploading",
      idempotency_key: idempotencyKey,
      order_type: orderType, sport: text(body.sport, 60), package_interest: text(body.package_interest, 80), add_on_interest: text(body.add_on_interest, 120) || null, style: text(body.style, 80),
      athlete_first_name: text(body.athlete_first_name, 80), athlete_last_name: text(body.athlete_last_name, 80), jersey_number: text(body.jersey_number, 30), position_event: text(body.position_event, 80), team_name: text(body.team_name, 120),
      primary_color: text(body.primary_color, 60), secondary_color: text(body.secondary_color, 60), graduation_year: text(body.graduation_year, 20) || null, season_year: text(body.season_year, 30) || null, headline: text(body.headline, 120) || null, stats: text(body.stats, 300) || null,
      team_size: orderType === "Team Order" ? teamSize : null, customer_name: text(body.customer_name, 120), customer_email: text(body.customer_email, 254).toLowerCase(), country: text(body.country, 80), state: text(body.state, 80) || null, phone: text(body.phone, 50) || null, instagram: text(body.instagram, 80) || null, deadline_date: text(body.deadline_date, 20) || null, notes: text(body.notes, 1200) || null,
      guardian_consent: body.guardian_consent === true, photo_rights_consent: body.photo_rights_consent === true, terms_consent: body.terms_consent === true, portfolio_contact_opt_in: body.portfolio_contact_opt_in === true,
      source: text(body.source, 50) || "website", utm_source: text(body.utm_source, 120) || null, utm_medium: text(body.utm_medium, 120) || null, utm_campaign: text(body.utm_campaign, 120) || null, utm_content: text(body.utm_content, 120) || null, landing_path: text(body.landing_path, 300) || "/", photo_count: fileCount,
    };
    let submissionId = "";
    const existing = await supabase.from("submissions").select("id,status").eq("idempotency_key", idempotencyKey).maybeSingle();
    if (existing.data?.id) {
      if (existing.data.status !== "uploading") return jsonError(new Error("This request has already been submitted."), 409);
      submissionId = existing.data.id;
      const { error } = await supabase.from("submissions").update(record).eq("id", submissionId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("submissions").insert(record).select("id").single();
      if (error || !data) throw error || new Error("The request record could not be created.");
      submissionId = data.id;
    }

    const uploads = [];
    for (let index = 0; index < fileCount; index += 1) {
      const path = `submissions/${submissionId}/${crypto.randomUUID()}.webp`;
      const { data, error } = await supabase.storage.from(bucketName).createSignedUploadUrl(path, { upsert: false });
      if (error || !data?.token) throw error || new Error("A secure photo upload could not be prepared.");
      uploads.push({ path, token: data.token });
    }
    if (!process.env.SUPABASE_ANON_KEY) throw new Error("The secure submission service is not configured yet.");
    return Response.json({
      submissionId,
      submissionToken: await createSubmissionToken(submissionId),
      uploads,
      bucket: bucketName,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    });
  } catch (error) {
    return jsonError(error, /configured/.test(error instanceof Error ? error.message : "") ? 503 : 400);
  }
}
