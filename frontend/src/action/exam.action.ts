"use server";

import { API_URL } from "@/lib/data";
import { cookies } from "next/headers";

export async function getMyExamsAction() {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/dashboard/takes`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch exams");
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
}

export async function getExamInfoAction(id: string) {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/exams/${id}/info`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch exam info");
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
}

export async function takeExamAction({
  exam_id,
  device_id,
}: {
  exam_id: string;
  device_id: string;
}) {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/take_exam/${exam_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      body: JSON.stringify({ device_id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        typeof error.detail === "string" ? error.detail : "Failed to take exam"
      );
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
}

export async function submitExamAction({
  takes_id,
  answers,
}: {
  takes_id: number;
  answers: { question_id: number; answer: string }[];
}) {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/answers/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      body: JSON.stringify({ takes_id, answers }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        typeof error.detail === "string"
          ? error.detail
          : "Failed to submit exam"
      );
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
}

export async function getExamAnswersAction(takes_id: number) {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/takes/${takes_id}/details`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        typeof error.detail === "string"
          ? error.detail
          : "Failed to fetch exam answers"
      );
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
}

export async function getExamRankingsAction(exam_id: number) {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/rankings/${exam_id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        typeof error.detail === "string"
          ? error.detail
          : "Failed to fetch exam rankings"
      );
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
}
