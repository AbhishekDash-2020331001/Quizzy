"use server";

import { API_URL } from "@/lib/data";
import { cookies } from "next/headers";

export const getDashboardInfoAction = async () => {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/dashboard`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard info");
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (e) {
    if (e instanceof Error) {
      return {
        success: false,
        error: e.message,
      };
    }
    return {
      success: false,
      error: "An unknown error occurred",
    };
  }
};

export const getAnalyticsAction = async () => {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/analytics/user`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch analytics");
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (e) {
    if (e instanceof Error) {
      return {
        success: false,
        error: e.message,
      };
    }
    return {
      success: false,
      error: "An unknown error occurred",
    };
  }
};
