"use server";

import { API_URL } from "@/lib/data";
import { cookies } from "next/headers";

export const listUploadsAction = async () => {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/uploads/myuploads`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch uploads");
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

export const uploadPdfAction = async ({
  url,
  pdf_name,
}: {
  url: string;
  pdf_name: string;
}) => {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/uploads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      body: JSON.stringify({ url, pdf_name }),
    });

    if (!response.ok) {
      throw new Error("Failed to upload PDF");
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

export const deleteUploadAction = async ({ id }: { id: number }) => {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/uploads/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete upload");
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
