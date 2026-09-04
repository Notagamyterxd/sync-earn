import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Builds the signed CPX Research offerwall URL for the current user.
 * The secure hash is md5(ext_user_id + "-" + CPX_SECURE_HASH) and is
 * computed server-side so the app secret never reaches the browser.
 */
export const getCpxWall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const appId = process.env["CPX_APP_ID"];
    const secret = process.env["CPX_SECURE_HASH"];
    if (!appId || !secret) return { ok: false as const, url: null };

    const { createHash } = await import("node:crypto");
    const userId = context.userId;
    const secureHash = createHash("md5").update(`${userId}-${secret}`).digest("hex");

    const params = new URLSearchParams({
      app_id: appId,
      ext_user_id: userId,
      secure_hash: secureHash,
    });

    return {
      ok: true as const,
      url: `https://offers.cpx-research.com/index.php?${params.toString()}`,
    };
  });
