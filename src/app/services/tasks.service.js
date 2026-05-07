async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = text ? { message: text } : null;
  }

  if (!res.ok) {
    const messageParts = [
      data?.error,
      data?.message,
      data?.details,
      data?.hint,
    ].filter(Boolean);

    const message =
      messageParts.join(" - ") ||
      `Request failed with status ${res.status} ${res.statusText}`;

    const error = new Error(message);
    error.status = res.status;
    error.payload = data;
    throw error;
  }

  return data;
}

// =========================
// GET PROJECT TASKS
// =========================
export async function getProjectTasks({
  projectId,
  epicId,
  status,
  search = "",
  signal,
}) {
  const params = new URLSearchParams();

  if (projectId) params.append("project_id", `eq.${projectId}`);
  if (epicId) params.append("epic_id", `eq.${epicId}`);
  if (status) params.append("status", `eq.${status}`);

  // 🔥 FIXED SEARCH (Supabase/PostgREST safe + encoded)
  if (search.trim()) {
    params.append(
      "title",
      `ilike.%${search.trim()}%`
    );
  }

  const res = await fetch(`/api/tasks?${params.toString()}`, {
    method: "GET",
    credentials: "include",
    signal,
    cache: "no-store",
  });

  return handleResponse(res);
}

// =========================
// GET TASK DETAILS
// =========================
export async function getTaskDetails({ projectId, taskId }) {
  const params = new URLSearchParams();

  if (projectId) params.append("project_id", `eq.${projectId}`);
  if (taskId) params.append("id", `eq.${taskId}`);

  const res = await fetch(`/api/tasks?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await handleResponse(res);
  return data?.data?.[0] || null;
}

// =========================
// CREATE TASK
// =========================
export async function createTask(data) {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

// =========================
// UPDATE TASK
// =========================
export async function updateTask(id, data) {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
    cache: "no-store",
  });

  return handleResponse(res);
}

// =========================
// GET TASKS BY STATUS
// =========================
export async function getTasksByStatus({
  projectId,
  status,
  search = "",
}) {
  const params = new URLSearchParams();

  if (projectId) params.append("project_id", `eq.${projectId}`);
  if (status) params.append("status", `eq.${status}`);

  // 🔥 FIXED SEARCH (same rule)
  if (search.trim()) {
    params.append(
      "title",
      `ilike.%${search.trim()}%`
    );
  }

  const res = await fetch(`/api/tasks?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(res);
}