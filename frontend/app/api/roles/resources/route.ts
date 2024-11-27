import { NextResponse } from "next/server";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { apiRequest } from "@/utils/apiRequest";

export async function GET(request: Request) {
  try {
    const { accessToken } = await getAccessToken();
    if (!accessToken) {
      throw new Error("Access token is undefined");
    }

    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const level = url.searchParams.get("level") || "";

    const encodedLevel = encodeURIComponent(level);

    const endpoint = `/roles/levels?role=${role}&level=${encodedLevel}`;

    const data = await apiRequest(endpoint, "GET", accessToken);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/teams:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
