import { BulkImporter } from "./router";
import { AdminAction } from "../types";
import User from "../../../resources/User";
import { ResourceKey } from "../../../resources/types";

export const headings = [
  "Restriction",
  "Last",
  "First",
  "Username",
  "Email",
  "Course",
  "Section",
  "Title",
  "Phone",
];

const bulkImport: BulkImporter = (setSubmitting, dispatch, records): void => {
  const dispatchError = (error: Error): void => {
    setSubmitting(false);
    dispatch({ type: AdminAction.Error, payload: { error } });
  };
  if (!Array.isArray(records))
    return dispatchError(
      new Error("Import failed, could not parse input as an array")
    );

  const body = JSON.stringify(
    records.map((record) => ({
      restriction: Number(record.Restriction),
      last: record.Last,
      first: record.First,
      username: record.Username,
      email: record.Email,
      phone: record.Phone,
    }))
  );

  fetch(`${User.url}/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
    .then((res) => res.json())
    .then(({ error, data }) => {
      if (error) throw error;
      setSubmitting(false);
      dispatch({
        type: AdminAction.FileImportSuccess,
        payload: {
          resources: {
            [ResourceKey.Users]: (data as User[]).map((u) => new User(u)),
          },
        },
      });
    })
    .catch(dispatchError);
};

export default [headings, bulkImport] as [string[], BulkImporter];
