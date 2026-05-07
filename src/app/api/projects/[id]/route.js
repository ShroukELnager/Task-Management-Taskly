import { getTokens } from "@/app/lib/auth/getTokens";

const BASE_URL = "https://pcufxstnppfqmzgslxlk.supabase.co";
const API_KEY = process.env.API_KEY?.trim();

function handleError(message, status = 500) {
  return Response.json({ error: message }, { status });
}

export async function GET(_req, { params }) {
  try {
    const { access_token } = await getTokens();

    if (!access_token) {
      return handleError("Unauthorized", 401);
    }

    if (!API_KEY) {
      return handleError("Missing API key", 500);
    }

    const routeParams = await params;
    const projectId = routeParams?.id;

    if (!projectId) {
      return handleError("Project id is required", 400);
    }

    const res = await fetch(
      `${BASE_URL}/rest/v1/projects?id=eq.${projectId}`,
      {
        method: "GET",
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return handleError(
        data?.message || "Failed to fetch project",
        res.status
      );
    }

    return Response.json({ data });
  } catch (err) {
    return handleError(err.message || "Something went wrong");
  }
}

export async function PATCH(req, { params }) {
  try {
    const { access_token } = await getTokens();

    // ✅ check token
    if (!access_token) {
      return handleError("Unauthorized", 401);
    }

    if (!API_KEY) {
      return handleError("Missing API key", 500);
    }

    const routeParams = await params;
    const projectId = routeParams?.id;

    if (!projectId) {
      return handleError("Project id is required", 400);
    }

    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return handleError("Request body is required", 400);
    }

    const res = await fetch(
      `${BASE_URL}/rest/v1/projects?id=eq.${projectId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
          Authorization: `Bearer ${access_token}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      return handleError(
        errorData?.message || "Failed to update project",
        res.status
      );
    }

    const data = await res.json();

    return Response.json({
      message: "Project updated successfully",
      data,
    });
  } catch (err) {
    return handleError(err.message || "Something went wrong");
  }
}
