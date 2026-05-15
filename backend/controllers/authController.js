import bcrypt from "bcryptjs";
import { supabaseAdmin, supabaseFromRequest } from "../supabase/supabaseClient.js";



function buildUserResponse(profile, user) {
  return {
    id: user.id,
    name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
    email: user.email,
    role: profile?.role ?? "customer",
    phone: profile?.phone ?? null,
    photo: profile?.photo_url ?? null,
    authProvider: user.user_metadata?.provider ?? "unknown",
  };
}

async function getProfileByAuthUserId(userId) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, phone, photo_url, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "name, email and password are required" });
    }

    // creates the auth.users row
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        provider: "local",
      },
    });

    if (createError) return res.status(400).json({ msg: createError.message });

    // Create/ensure public.profiles row
    const userId = created.user.id;

    const profilePayload = {
      id: userId,
      full_name: name,
      phone: phone ?? null,
      photo_url: null,
      role: "customer",
    };

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(profilePayload, { onConflict: "id" });
    if (profileError) return res.status(500).json({ msg: profileError.message });

    const user = created.user;
    const profile = await getProfileByAuthUserId(userId);

    //  access token to frontend.
    
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) return res.status(400).json({ msg: signInError.message });

    const accessToken = signInData.session.access_token;

    return res.status(201).json({
      token: accessToken,
      user: buildUserResponse(profile, user),
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "email and password are required" });
    }

    // Supabase Auth sign in
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.status(400).json({ msg: error.message });

    const user = data.user;
    const profile = await getProfileByAuthUserId(user.id);

    if (!profile) {
      // if missing, create minimal profile
      const { error: upsertError } = await supabaseAdmin.from("profiles").upsert(
        {
          id: user.id,
          full_name: user.user_metadata?.full_name ?? "",
          phone: null,
          photo_url: null,
          role: "customer",
        },
        { onConflict: "id" }
      );
      if (upsertError) return res.status(500).json({ msg: upsertError.message });
    }

    return res.json({
      token: data.session.access_token,
      user: buildUserResponse(profile, user),
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const googleAuthUser = async (req, res) => {
  try {
    
    const { accessToken, name, email } = req.body;

    if (!accessToken) {
      // legacy fallback: 
      return res.status(400).json({
        msg: "Google login requires Supabase access token. Please migrate frontend to send accessToken.",
      });
    }

    // Verify access token and get auth user
    const { data: verified, error: verifyError } = await supabaseAdmin.auth.getUser(accessToken);

    if (verifyError || !verified?.user) {
      return res.status(401).json({ msg: "Invalid Google access token" });
    }

    const user = verified.user;
    const profile = await getProfileByAuthUserId(user.id);

    if (!profile) {
      const { error: upsertError } = await supabaseAdmin.from("profiles").upsert(
        {
          id: user.id,
          full_name: name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
          phone: null,
          photo_url: user.user_metadata?.avatar_url ?? null,
          role: "customer",
        },
        { onConflict: "id" }
      );

      if (upsertError) return res.status(500).json({ msg: upsertError.message });
    }

    const finalProfile = await getProfileByAuthUserId(user.id);

    return res.json({
      token: accessToken,
      user: buildUserResponse(finalProfile, user),
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
