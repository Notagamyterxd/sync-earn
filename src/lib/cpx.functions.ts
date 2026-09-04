import { md5 } from "js-md5"; // Or whatever md5 utility library Lovable installed

// HARDCODED CREDENTIALS - Fixed for direct client-side Vite rendering
const CPX_APP_ID = "35898";
const CPX_SECURITY_HASH = "2oJcwBUTyANkDCVBaHO6QjCI1FFhK8uv";

export function getCpxWall(userId: string): string {
  if (!userId) return "";
  
  // Create the secure hash validation parameter that CPX requires
  const secure_hash = md5(`${userId}-${CPX_SECURITY_HASH}`);
  
  // Generate the clean live iframe address path
  return `https://cpx-research.com{CPX_APP_ID}&ext_user_id=${userId}&secure_hash=${secure_hash}`;
}
