export async function signup(data) {
  const res = await fetch("/api/auth/signUp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(
      result?.error_description || result?.error || "Signup failed"
    );
  }

  return result;
}

export async function login(data) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(
      result?.error_description || result?.error || "Login failed"
    );
  }

  return result;
}

export async function logout() {
  const res = await fetch("/api/auth/logOut", {
    method: "POST",
    credentials: "include",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result?.error || "Logout failed");
  }

  return result;
}

export async function forgotPassword(data) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(
      result?.error_description || result?.error || "Forgot password failed"
    );
  }

  return result;
}

export async function resetPassword(data) {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(
      result?.error_description || result?.error || "Reset password failed"
    );
  }

  return result;
}
