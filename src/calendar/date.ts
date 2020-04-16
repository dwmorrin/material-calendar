export const getFormattedEventInterval = (
  start: string,
  end: string
): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateFormat = { weekday: "long", day: "numeric", month: "long" };
  const timeFormat = { hour12: true, timeStyle: "short" };
  return `${startDate.toLocaleDateString(
    "en-US",
    dateFormat
  )} \u00B7 ${startDate.toLocaleTimeString(
    "en-US",
    timeFormat
  )} - ${endDate.toLocaleTimeString("en-US", timeFormat)}`;
};
