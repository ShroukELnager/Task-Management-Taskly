async function handleResponse(res) {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong");
  }

  return data;
}

export async function getProjectMembers(projectId) {
  const res = await fetch(`/api/members?project_id=${projectId}`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(res);
}