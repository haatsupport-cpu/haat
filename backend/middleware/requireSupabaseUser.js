import { supabaseAdmin } from "../supabase/supabaseClient.js";

export function requireSupabaseUser() {
  return async function requireUser(req, res, next) {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : null;

      if (!token) {
        return res.status(401).json({ message: "Missing access token" });
      }

      //  verifies token and returns user + JWT claims.
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ message: "Invalid access token" });
      }

      // for downstream handlers
      req.supabase = {
        auth: { user },
        accessToken: token,
      };

      return next();
    } catch (err) {
      return res.status(401).json({ message: "Auth failed", error: err.message });
    }
  };
}
