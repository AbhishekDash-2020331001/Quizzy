import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const c = await cookies();
  // This should be your backend URL
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${backendUrl}/payments/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${c.get("token")?.value}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.detail || "Failed to fetch payment history" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
