import { NextResponse } from "next/server";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { apiRequest } from "@/utils/apiRequest";

// Handle GET requests
export async function GET() {
  try {
    const { accessToken } = await getAccessToken();
    if (!accessToken) {
      throw new Error("Access token is undefined");
    }

    const data = await apiRequest("/roles", "GET", accessToken);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/teams:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
