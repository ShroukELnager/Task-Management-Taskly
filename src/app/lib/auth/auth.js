import { setAccessToken } from "@/app/features/users/userSlice";
import Cookies from "js-cookie";
import { fetchUsers } from "@/app/features/users/usersThunk";
const BASE_URL = "https://pcufxstnppfqmzgslxlk.supabase.co/auth/v1/token";

export const isTokenExpired = () => {
  const expiry = Cookies.get("access_token_expiry");

  if (!expiry) return true;

  const now = Math.floor(Date.now() / 1000);

  return now >= Number(expiry);
};

export const refreshAccessToken = async () => {
  try {
    const refresh_token = Cookies.get("refresh_token");

    if (!refresh_token) return null;

    const res = await fetch(`${BASE_URL}?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.API_KEY,
      },
      body: JSON.stringify({ refresh_token }),
    });

    const data = await res.json();

    if (!res.ok) return null;

    const { access_token, expires_at } = data;

    const expiresDate = new Date(expires_at * 1000);

    Cookies.set("access_token", access_token, {
      expires: expiresDate,
      secure: true,
      sameSite: "strict",
    });

    Cookies.set("access_token_expiry", expires_at, {
      expires: expiresDate,
    });

    return access_token;
  } catch (err) {
    console.error("Refresh token failed", err);
    return null;
  }
};

export const getValidAccessToken = async (dispatch) => {
  let token = Cookies.get("access_token");

  if (!token || isTokenExpired()) {
    token = await refreshAccessToken();

    if (token && dispatch) {
      dispatch(setAccessToken(token));
      dispatch(fetchUsers());
    }
  }

  return token;
};
