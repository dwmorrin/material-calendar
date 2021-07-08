import { ResourceKey } from "../../resources/types";
import { AdminAction, AdminState } from "../types";
import eventImport from "./event.import";
import rosterImport, { headings } from "./roster.import";

function defaultImporter(
  dispatch: (action: {
    type: AdminAction;
    payload?: Partial<AdminState>;
  }) => void
): void {
  dispatch({
    type: AdminAction.Error,
    payload: { error: new Error("resource has no bulk importer defined") },
  });
}

const defaultHeadings = ["Error: no headers defined"];

type HeadingsAndDispatch = [
  string[],
  (
    dispatch: (action: {
      type: AdminAction;
      payload?: Partial<AdminState>;
    }) => void,
    data: unknown,
    state?: AdminState
  ) => void
];

const defaultHeadingsAndDispatch: HeadingsAndDispatch = [
  defaultHeadings,
  defaultImporter,
];

const router = (key: ResourceKey): HeadingsAndDispatch =>
  ({
    [ResourceKey.Categories]: defaultHeadingsAndDispatch,
    [ResourceKey.Courses]: defaultHeadingsAndDispatch,
    [ResourceKey.Equipment]: defaultHeadingsAndDispatch,
    [ResourceKey.Events]: [defaultHeadings, eventImport] as HeadingsAndDispatch,
    [ResourceKey.Groups]: defaultHeadingsAndDispatch,
    [ResourceKey.Locations]: defaultHeadingsAndDispatch,
    [ResourceKey.Projects]: defaultHeadingsAndDispatch,
    [ResourceKey.Reservations]: defaultHeadingsAndDispatch,
    [ResourceKey.RosterRecords]: [
      headings,
      rosterImport,
    ] as HeadingsAndDispatch,
    [ResourceKey.Semesters]: defaultHeadingsAndDispatch,
    [ResourceKey.Tags]: defaultHeadingsAndDispatch,
    [ResourceKey.Users]: defaultHeadingsAndDispatch,
    [ResourceKey.VirtualWeeks]: defaultHeadingsAndDispatch,
  }[key]);

export default router;
