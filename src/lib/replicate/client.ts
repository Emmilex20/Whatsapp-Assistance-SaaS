import Replicate from "replicate";

export function getReplicateClient() {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not configured.");
  }

  return new Replicate({
    auth: token,
  });
}
