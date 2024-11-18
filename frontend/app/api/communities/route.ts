import { NextResponse } from "next/server";
import { getAccessToken } from "@auth0/nextjs-auth0";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Ensure this is set correctly

export async function GET() {
  console.log("API route /api/communities: Handler started");

  try {
    // Fetch session
    console.log("Fetching session...");
    const { accessToken } = await getAccessToken();

    console.log("API-Key:", process.env.NEXT_PUBLIC_API_KEY);
    console.log("Access Token:", accessToken);
    console.log("API URL:", `${API_URL}/communities`);

    // Fetch from backend API
    const response = await fetch(`${API_URL}/communities`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
    });

    console.log("Backend response status:", response.status);

    const responseBody = await response.clone().text(); // Clone to avoid consuming the body
    console.log("Backend response body:", responseBody);

    if (!response.ok) {
      console.error("Backend error occurred:", responseBody);
      return NextResponse.json(
        { error: `Error from backend API: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend data:", data);

    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in API route /api/communities:", error.message);
    } else {
      console.error("Error in API route /api/communities:", error);
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
