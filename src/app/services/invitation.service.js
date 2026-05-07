

export async function acceptInvitation(token) {
  const res = await fetch("/api/invitation/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_token: token,
    }),
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("You must be logged in to accept this invitation");
    }

    if (res.status === 403) {
      throw new Error("You are not allowed to accept this invitation");
    }

    throw new Error(
      data?.error ||
      data?.message ||
      "Invalid or expired invitation"
    );
  }

  return data;
}
export async function sendInvitation({
  email,
  projectId,
}) {
  const res = await fetch("/api/invitation/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 

    body: JSON.stringify({
      p_email: email,
      p_project_id: projectId,
      p_app_url: window.location.origin,
    }),
  });

  const result = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("You must be logged in to send invitations");
    }

    if (res.status === 403) {
      throw new Error("You are not allowed to invite members to this project");
    }

    throw new Error(
      result?.error_description ||
      result?.error ||
      result?.message ||
      "Send invitation failed"
    );
  }

  return result;
}
