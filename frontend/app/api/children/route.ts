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
    const childId = url.searchParams.get("child_id");
    const communityId = url.searchParams.get("community_id");

    // Determine endpoint based on query parameters
    let endpoint = "/children";
    if (childId) {
      endpoint = `/children/${childId}`;
    } else if (communityId) {
      endpoint = `/children?community_id=${communityId}`;
    }
    const data = await apiRequest(endpoint, "GET", accessToken);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/children:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken } = await getAccessToken();

    if (!accessToken) {
      throw new Error("Access token is undefined");
    }

    const body = await request.json();

    const data = await apiRequest("/children", "POST", accessToken, body);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/children:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { accessToken } = await getAccessToken();

    if (!accessToken) {
      throw new Error("Access token is undefined");
    }

    const url = new URL(request.url);
    const childId = url.searchParams.get("child_id");
    const cascade = url.searchParams.get("cascade");

    if (!childId) {
      return NextResponse.json(
        { error: "Missing `childId` in query parameters" },
        { status: 400 }
      );
    }

    const endpoint = `/children/${childId}?cascade=${cascade || "false"}`;

    await apiRequest(endpoint, "DELETE", accessToken);

    return NextResponse.json(
      { message: "Child deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/children:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { accessToken } = await getAccessToken();

    if (!accessToken) {
      throw new Error("Access token is undefined");
    }

    const url = new URL(request.url);
    const childId = url.searchParams.get("child_id");

    if (!childId) {
      return NextResponse.json(
        { error: "Missing `childId` in query parameters" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const endpoint = `/children/${childId}`;
    const data = await apiRequest(endpoint, "PATCH", accessToken, body);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/children:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
