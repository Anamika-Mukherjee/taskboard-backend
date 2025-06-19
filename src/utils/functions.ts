import Project from "../models/Project";

function generateRandomKey(length = 5): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export async function generateUniqueProjectKey(): Promise<string> {
  let key = generateRandomKey();
  let exists = await Project.findOne({ projectKey: key }).exec();
  let attempts = 0;

  while (exists) {
    attempts++;
    // Add an extra random char at the end or regenerate full key
    key = generateRandomKey(5) + attempts.toString();
    exists = await Project.findOne({ projectKey: key }).exec();

    if (attempts > 10) {
      // Safety net to avoid infinite loop, you can throw error or increase key length
      throw new Error("Unable to generate unique project key");
    }
  }

  return key;
}