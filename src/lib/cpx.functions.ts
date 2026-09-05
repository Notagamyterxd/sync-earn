import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns the signed CPX Research offer wall URL for the logged-in user.
 * The secure hash is computed server-side so the secret never reaches the browser.
 */
export const getCpxWall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const appId = process.env["CPX_APP_ID"] ?? "35898";
    const secret = process.env["CPX_SECURE_HASH"];
    const userId = context.userId;

    const params = new URLSearchParams({
      app_id: appId,
      ext_user_id: userId,
    });

    if (secret) {
      const { createHash } = await import("node:crypto");
      const hash = createHash("md5").update(`${userId}-${secret}`).digest("hex");
      params.set("secure_hash", hash);
    }

    return { url: `https://offers.cpx-research.com/index.php?${params.toString()}` };
  });
