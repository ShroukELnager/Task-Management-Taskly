import { getTokens } from "@/app/lib/auth/getTokens";

const apiKey = process.env.API_KEY?.trim();
const baseUrl = "https://pcufxstnppfqmzgslxlk.supabase.co";

export async function GET(req) {
  try {
    const { access_token } = await getTokens();

    if (!access_token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const project_id = searchParams.get("project_id");
    const id = searchParams.get("id");
    const limit = Number(searchParams.get("limit") || 6);
    const offset = Number(searchParams.get("offset") || 0);
    const search = searchParams.get("search") || "";

    if (!project_id) {
      return Response.json(
        { error: "project_id is required" },
        { status: 400 }
      );
    }

    let url = `${baseUrl}/rest/v1/project_epics?project_id=eq.${project_id}`;

    if (id) {
      url += `&id=eq.${id}`;
    }

    if (search.trim()) {
      url += `&title=ilike.*${search.trim()}*`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${access_token}`,

        Range: id ? "0-0" : `${offset}-${offset + limit - 1}`,
        Prefer: "count=exact",
      },
    });

    const data = await res.json();

    const contentRange = res.headers.get("content-range");

    const totalCount = contentRange
      ? Number(contentRange.split("/")[1])
      : 0;

    return Response.json({
      data,
      totalCount,
    });
  } catch (err) {
    return Response.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
    const { access_token } = await getTokens();

    if (!access_token) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return Response.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${baseUrl}/rest/v1/epics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${access_token}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { error: data?.message || "Failed to create epic" },
        { status: res.status }
      );
    }

    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
