import { ResourceKey } from "../../../resources/types";
import { AdminAction, AdminState } from "../types";
import courseImport from "./course.import";
import equipmentImport from "./equipment.import";
import eventImport from "./event.import";
import locationImport from "./location.import";
import projectImport from "./project.import";
import sectionImport from "./section.import";
import userImport from "./user.import";

export type BulkImporter = (
  setSubmitting: (submitting: boolean) => void,
  dispatch: (action: {
    type: AdminAction;
    payload: Record<string, unknown>;
  }) => void,
  data: unknown,
  state?: AdminState
) => void;

const defaultImporter: BulkImporter = (setSubmitting, dispatch) => {
  setSubmitting(false);
  dispatch({
    type: AdminAction.Error,
    payload: { error: new Error("resource has no bulk importer defined") },
  });
};

const defaultHeadingsAndDispatch: [string[], BulkImporter] = [
  ["Error: no headers defined"],
  defaultImporter,
];

const router = (key: ResourceKey): [string[], BulkImporter] =>
  ({
    [ResourceKey.Categories]: defaultHeadingsAndDispatch,
    [ResourceKey.Courses]: courseImport,
    [ResourceKey.Equipment]: equipmentImport,
    [ResourceKey.Events]: eventImport,
    [ResourceKey.Groups]: defaultHeadingsAndDispatch,
    [ResourceKey.Locations]: locationImport,
    [ResourceKey.Projects]: projectImport,
    [ResourceKey.Reservations]: defaultHeadingsAndDispatch,
    [ResourceKey.RosterRecords]: defaultHeadingsAndDispatch,
    [ResourceKey.Sections]: sectionImport,
    [ResourceKey.Semesters]: defaultHeadingsAndDispatch,
    [ResourceKey.Tags]: defaultHeadingsAndDispatch,
    [ResourceKey.Users]: userImport,
    [ResourceKey.VirtualWeeks]: defaultHeadingsAndDispatch,
  }[key]);

export default router;
