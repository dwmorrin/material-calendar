import { AdminAction } from "../types";
import RosterRecord from "../../resources/RosterRecord";

export const headings = [
  "Course",
  "Catalog",
  "Section",
  "Instructor",
  "Student",
  "NetID",
  "Restriction",
  "Project",
];

const bulkImport = (
  dispatch: (action: {
    type: AdminAction;
    payload: Record<string, unknown>;
  }) => void,
  records: unknown
): void => {
  const dispatchError = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });

  if (!Array.isArray(records))
    return dispatchError(
      new Error(
        "Roster import failed: could not parse roster (records not an array)"
      )
    );

  fetch(`${RosterRecord.url}/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ records }),
  })
    .then((res) => res.json())
    .then(({ error, data }) => {
      if (error) return dispatchError(error);
      console.log({ data });
      dispatchError(new Error("post OK, but success handler not written"));
    })
    .catch(dispatchError);
};

export default bulkImport;
