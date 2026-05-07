import { getTokens } from "@/app/lib/auth/getTokens";


export async function GET() {
  const { access_token } = await getTokens();

  if (!access_token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.API_KEY?.trim();
  const baseUrl = "https://pcufxstnppfqmzgslxlk.supabase.co";

  if (!apiKey) {
    return Response.json({ error: "Missing API key" }, { status: 500 });
  }

  const res = await fetch(
    `${baseUrl}/rest/v1/rpc/get_projects`,
    {
      method: "GET",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
        Prefer: "count=exact",
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return Response.json(data, { status: res.status });
  }

  return Response.json({
    data,
    totalCount: data?.length ?? 0,
  });
}

export async function POST(req) {
  const { access_token } = await getTokens();

  if (!access_token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.API_KEY?.trim();
  const baseUrl = "https://pcufxstnppfqmzgslxlk.supabase.co";

  if (!apiKey) {
    return Response.json({ error: "Missing API key" }, { status: 500 });
  }

  const body = await req.json();

  const res = await fetch(
    `${baseUrl}/rest/v1/projects`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${access_token}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return Response.json(data, { status: res.status });
  }

  return Response.json(data, { status: 201 });
}
