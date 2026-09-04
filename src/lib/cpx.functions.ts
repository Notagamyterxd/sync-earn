// Pure JavaScript MD5 Implementation (Requires zero external npm packages)
function md5(string: string) {
  function k(n: number) { return Math.sin(n) * 4294967296 | 0; }
  let b = [1732584193, -271733879, -1732584194, 271733878],
      m = [],
      s = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
           5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
           4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
           6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21], i;
  let str = unescape(encodeURIComponent(string)), l = str.length, n = (l + 8 >> 6) + 1, d = [];
  for (i = 0; i < l; ++i) d[i >> 2] |= str.charCodeAt(i) << (i % 4 << 3);
  d[l >> 2] |= 128 << (l % 4 << 3);
  d[n * 16 - 2] = l * 8;
  for (i = 0; i < n; ++i) {
    let a = b.slice(0), J = i * 16;
    for (let j = 0; j < 64; ++j) {
      let f, g;
      if (j < 16) { f = a[1] & a[2] | ~a[1] & a[3]; g = j; }
      else if (j < 32) { f = a[3] & a[1] | ~a[3] & a[2]; g = (5 * j + 1) % 16; }
      else if (j < 48) { f = a[1] ^ a[2] ^ a[3]; g = (3 * j + 5) % 16; }
      else { f = a[2] ^ (a[1] | ~a[3]); g = (7 * j) % 16; }
      f = f + a[0] + (k(j + 1) >>> 0) + (d[J + g] >>> 0) | 0;
      a = [a[3], (f << s[j] | f >>> 32 - s[j]) + a[1] | 0, a[1], a[2]];
    }
    for (let j = 0; j < 4; ++j) b[j] = b[j] + a[j] | 0;
  }
  let hex = '';
  for (i = 0; i < 32; ++i) hex += ((b[i >> 3] >> (i % 8 << 2)) & 15).toString(16);
  return hex;
}

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
