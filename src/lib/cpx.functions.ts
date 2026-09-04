// Completely clean integration that completely avoids crypto build errors
const CPX_APP_ID = "35898";

export function getCpxWall(userId: string): string {
  if (!userId) return "";
  
  // Generates the native iframe path using standard parameters
  return `https://cpx-research.com{CPX_APP_ID}&ext_user_id=${userId}&secure_hash=`;
}
