"use client";

import { useState, useEffect, useCallback } from "react";

const useTabActive = () => {
  const [isTabActive, setIsTabActive] = useState(true);

  const handleVisibilityChange = useCallback(() => {
    setIsTabActive(document.visibilityState === "visible");
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return isTabActive;
};

export default useTabActive;
