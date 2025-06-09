"use server";

import { API_URL } from "@/lib/data";
import { cookies } from "next/headers";

export const registerAction = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: name,
        email,
        password,
        teacher: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to register");
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

export const loginAction = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const cookieStore = await cookies();
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }

    const data = await response.json();

    cookieStore.set("token", data.access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 3,
      path: "/",
    });

    return {
      success: true,
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
