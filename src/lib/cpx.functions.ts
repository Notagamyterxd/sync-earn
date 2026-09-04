// Uses native browser Web Crypto API to ensure 0 build compile errors on Vercel
async function hashMD5(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("MD5", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// HARDCODED CREDENTIALS - Pure Frontend Vite Rendering
const CPX_APP_ID = "35898";
const CPX_SECURITY_HASH = "2oJcwBUTyANkDCVBaHO6QjCI1FFhK8uv";

export async function getCpxWall(userId: string): Promise<string> {
  if (!userId) return "";
  
  // Creates the secure hash validation parameter that CPX requires
  const secure_hash = await hashMD5(`${userId}-${CPX_SECURITY_HASH}`);
  
  // Generates the live iframe address path
  return `https://cpx-research.com{CPX_APP_ID}&ext_user_id=${userId}&secure_hash=${secure_hash}`;
}
