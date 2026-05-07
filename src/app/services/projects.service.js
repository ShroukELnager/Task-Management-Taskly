export async function getProjects() {
  const res = await fetch("/api/projects");
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result?.error || "Failed to fetch projects");
  }

  return result;
}
export async function getProjectById(id) {
  const res = await fetch(`/api/projects/${id}`, {
    credentials: "include",
  });
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result?.error || "Failed to fetch project");
  }

  return result?.data?.[0] || result?.data || result;
}
export async function createProject(data) {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(
      result?.message || result?.error || "Failed to create project"
    );
  }

  return result;
}

export async function updateProject(id, data) {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result?.error || "Failed to update project");
  }

  return result;
}
