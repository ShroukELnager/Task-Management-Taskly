import { getTokens } from "@/app/lib/auth/getTokens";

async function readJsonSafely(res) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function POST(req) {
  const baseUrl = "https://pcufxstnppfqmzgslxlk.supabase.co";

  try {
    const apiKey = process.env.API_KEY?.trim();

    const { access_token } = await getTokens();

    if (!apiKey) {
      return Response.json({ error: "Missing API key" }, { status: 500 });
    }

    if (!access_token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { p_email, p_project_id, p_app_url } = body;

    if (!p_email || !p_project_id || !p_app_url) {
      return Response.json(
        { error: "p_email, p_project_id, and p_app_url are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${baseUrl}/rest/v1/rpc/invite_member`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${access_token}`, 
      },
      body: JSON.stringify({
        p_email,
        p_project_id,
        p_app_url,
        p_base_url: baseUrl,
      }),
    });

    const data = await readJsonSafely(res);

    if (!res.ok) {
      return Response.json(
        { error: data?.message || data?.error || "Failed to send invitation" },
        { status: res.status }
      );
    }

    return Response.json({
      message: "Invitation sent successfully",
      data,
    });
  } catch (err) {
    return Response.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
