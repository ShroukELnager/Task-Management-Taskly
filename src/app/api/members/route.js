import { getTokens } from "@/app/lib/auth/getTokens";

const apiKey = process.env.API_KEY?.trim();
const baseUrl = "https://pcufxstnppfqmzgslxlk.supabase.co";

function handleError(message, status = 500) {
  return Response.json({ error: message }, { status });
}

export async function GET(req) {
  try {
    const { access_token } = await getTokens();

    // ✅ check token
    if (!access_token) {
      return handleError("No token found", 401);
    }

    if (!baseUrl || !apiKey) {
      return handleError("Server configuration error", 500);
    }

    const { searchParams } = new URL(req.url);
    const project_id = searchParams.get("project_id");

    if (!project_id) {
      return handleError("project_id is required", 400);
    }

    const res = await fetch(
      `${baseUrl}/rest/v1/get_project_members?project_id=eq.${project_id}`,
      {
        method: "GET",
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      return handleError(
        errorData?.message || "Failed to fetch project members",
        res.status
      );
    }

    const data = await res.json();

    return Response.json({
      message: "Project members fetched successfully",
      data,
    });
  } catch (err) {
    return handleError(err.message || "Something went wrong");
  }
}