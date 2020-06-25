export const prettyPrintFilename = (filename: string): string => {
  const filenameDateRegex = /\d{4}-\d{2}-\d{2}_\d{2}:\d{2}:\d{2}/;
  const matchResult = filename.match(filenameDateRegex);
  if (!matchResult) return filename;
  const [dateString] = matchResult;
  return new Date(
    dateString.replace("_", "T").concat(".000Z")
  ).toLocaleString("en-US", { timeZone: "UTC" });
};
