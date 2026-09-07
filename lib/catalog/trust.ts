// The trust line (C14) and the two flags that gate its fourth segment (CONTRACTS §4.7).
//
// "Never used for AI training" is a claim about Vertex AI's data-use terms. It is rendered only
// when BOTH flags are true — `vertexNoTrainingVerified` flips after the owner's Vertex data-use
// check (spec §12 #15) and `aiTrainingClaim` is the spec's own name for the same gate. Until then
// the line has three segments and says nothing it cannot prove.

export const vertexNoTrainingVerified = false as const;
export const aiTrainingClaim = false as const;

export const TRUST_SEGMENTS = [
  "Never posted without your OK",
  "Deleted after delivery, on a schedule you can see",
  "Parent/guardian consent required",
] as const;

export const AI_TRAINING_SEGMENT = "Never used for AI training";

/** The segments a TrustLine renders, in order; the AI-training segment is prepended only when both flags are true. */
export function trustLineSegments(): string[] {
  const both: boolean = vertexNoTrainingVerified && aiTrainingClaim;
  return both ? [AI_TRAINING_SEGMENT, ...TRUST_SEGMENTS] : [...TRUST_SEGMENTS];
}
