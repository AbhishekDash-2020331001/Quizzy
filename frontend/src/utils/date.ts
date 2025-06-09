export const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
