import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { amount, currency } = await request.json();
  const c = await cookies();
  // This should be your backend URL
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${backendUrl}/payments/create-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${c.get("token")?.value}`,
      },
      body: JSON.stringify({ amount, currency }),
    });

    console.log(await res.text());
    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.detail || "Failed to create payment intent" },
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
