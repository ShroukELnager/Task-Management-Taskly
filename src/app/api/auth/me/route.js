import { getTokens } from "@/app/lib/auth/getTokens";

export async function GET() {
  const { access_token } = await getTokens();

  if (!access_token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ authenticated: true });
}
