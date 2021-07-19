import { ResourceKey } from "../../resources/types";
import { AdminAction, AdminState } from "../types";
import eventImport from "./event.import";
import locationImport from "./location.import";
import rosterImport from "./roster.import";

export type BulkImporter = (
  dispatch: (action: {
    type: AdminAction;
    payload: Record<string, unknown>;
  }) => void,
  data: unknown,
  state?: AdminState
) => void;

const defaultImporter: BulkImporter = (dispatch) =>
  dispatch({
    type: AdminAction.Error,
    payload: { error: new Error("resource has no bulk importer defined") },
  });

const defaultHeadingsAndDispatch: [string[], BulkImporter] = [
  ["Error: no headers defined"],
  defaultImporter,
];

const router = (key: ResourceKey): [string[], BulkImporter] =>
  ({
    [ResourceKey.Categories]: defaultHeadingsAndDispatch,
    [ResourceKey.Courses]: defaultHeadingsAndDispatch,
    [ResourceKey.Equipment]: defaultHeadingsAndDispatch,
    [ResourceKey.Events]: eventImport,
    [ResourceKey.Groups]: defaultHeadingsAndDispatch,
    [ResourceKey.Locations]: locationImport,
    [ResourceKey.Projects]: defaultHeadingsAndDispatch,
    [ResourceKey.Reservations]: defaultHeadingsAndDispatch,
    [ResourceKey.RosterRecords]: rosterImport,
    [ResourceKey.Semesters]: defaultHeadingsAndDispatch,
    [ResourceKey.Tags]: defaultHeadingsAndDispatch,
    [ResourceKey.Users]: defaultHeadingsAndDispatch,
    [ResourceKey.VirtualWeeks]: defaultHeadingsAndDispatch,
  }[key]);

export default router;
