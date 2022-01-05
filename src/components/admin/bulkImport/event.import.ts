import { AdminAction } from "../../../admin/types";
import Event from "../../../resources/Event";
import { BulkImporter } from "./router";
import { ResourceKey } from "../../../resources/types";

// this can also be accomplished in mysql with DATE(input_string),
// but easy enough to do it in javascript and doing it twice is fine as well
// problem is if the spreadsheet formatted "2000-01-01" as "2000-1-1",
// this will not compare correctly to existing dates without functions like
// DATE().
// TODO catch and re-format any date format, not just "yyyy-m-d"
const fixLeadingZeros = (dateStr: string): string => {
  const [date, time] = dateStr.split(" ");
  const [year, month, day] = date.split("-");
  const [hour, minute, second] = time.split(":");
  const make2digit = (num: number): string => (num < 10 ? `0${num}` : `${num}`);
  const res = [month, day, hour, minute, second].map(Number).map(make2digit);
  return `${year}-${res[0]}-${res[1]} ${res[2]}:${res[3]}:${res[4]}`;
};

const headings = ["Title", "Location", "Start", "End", "Reservable"];

const bulkImport: BulkImporter = (setSubmitting, dispatch, events) => {
  const dispatchError = (error: Error): void => {
    setSubmitting(false);
    dispatch({ type: AdminAction.Error, payload: { error } });
  };
  if (!Array.isArray(events))
    return dispatchError(
      new Error(
        "Event import failed: could not parse file (records not an array)"
      )
    );
  fetch(`${Event.url}/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      events.map(({ Title, Location, Start, End, Reservable }) => ({
        title: Title,
        locationId: Location,
        start: fixLeadingZeros(Start),
        end: fixLeadingZeros(End),
        reservable: Number(Reservable),
      }))
    ),
  })
    .then((response) => response.json())
    .then(({ data, error }) => {
      if (error) return dispatchError(error);
      setSubmitting(false);
      dispatch({
        type: AdminAction.FileImportSuccess,
        payload: {
          resources: {
            [ResourceKey.Events]: (data as Event[]).map((e) => new Event(e)),
          },
        },
      });
    })
    .catch(dispatchError);
};

export default [headings, bulkImport] as [string[], BulkImporter];
