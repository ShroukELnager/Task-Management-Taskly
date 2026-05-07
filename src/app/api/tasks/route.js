import { getTokens } from "@/app/lib/auth/getTokens";

const apiKey = process.env.API_KEY?.trim();
const baseUrl = "https://pcufxstnppfqmzgslxlk.supabase.co";

const READ_TABLE = "project_tasks";
const WRITE_TABLE = "tasks";

function handleError(message, status = 500) {
  return Response.json({ error: message }, { status });
}

export async function GET(req) {
  try {
    const { access_token } = await getTokens();

    if (!access_token) {
      return handleError("No token found", 401);
    }

    if (!baseUrl || !apiKey) {
      return handleError("Server configuration error", 500);
    }

    const url = new URL(req.url);
    const queryString = url.search;

    const res = await fetch(
      `${baseUrl}/rest/v1/${READ_TABLE}${queryString}`,
      {
        method: "GET",
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    let data;
    try {
      data = await res.json();
    } catch {
      return handleError("Invalid response from server", 500);
    }

    if (!res.ok) {
      return handleError(
        data?.message || data?.error || "Failed to fetch tasks",
        res.status
      );
    }

    return Response.json({
      message: "Tasks fetched successfully",
      data,
    });
  } catch (err) {
    return handleError(err.message || "Something went wrong");
  }
}

export async function POST(req) {
  try {
    const { access_token } = await getTokens();

    if (!access_token) {
      return handleError("No token found", 401);
    }

    if (!baseUrl || !apiKey) {
      return handleError("Server configuration error", 500);
    }

    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return handleError("Request body is required", 400);
    }

    const res = await fetch(`${baseUrl}/rest/v1/${WRITE_TABLE}`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      return handleError("Invalid response from server", 500);
    }

    if (!res.ok) {
      return handleError(
        data?.message || data?.error || "Failed to create task",
        res.status
      );
    }

    return Response.json(
      {
        message: "Task created successfully",
        data,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleError(err.message || "Something went wrong");
  }
}
