import { makeStyles } from "@material-ui/core";

export const prettyPrintFilename = (filename: string): string => {
  const filenameDateRegex = /\d{4}-\d{2}-\d{2}_\d{2}:\d{2}:\d{2}/;
  const matchResult = filename.match(filenameDateRegex);
  if (!matchResult) return filename;
  const [dateString] = matchResult;
  return new Date(
    dateString.replace("_", "T").concat(".000Z")
  ).toLocaleString("en-US", { timeZone: "UTC" });
};

export const useStyles = makeStyles({
  item: { display: "flex", justifyContent: "space-between" },
});

//! TODO this needs a modal confirmation, loading, and success/failure handling
export const restore = (filename: string): Promise<void> =>
  fetch(`/api/backup/restore/${filename}`, { method: "POST" })
    .then((response) => response.json())
    .then(({ data }) => console.log(data))
    .catch(console.error);
