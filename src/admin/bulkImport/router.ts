import { ResourceKey } from "../../resources/types";
import { AdminAction, AdminState } from "../types";
import eventImport from "./event.import";
import rosterImport from "./roster.import";

function defaultImporter(
  dispatch: (action: { type: AdminAction; payload: {} }) => void
): void {
  dispatch({
    type: AdminAction.Error,
    payload: { error: "resource has no bulk importer defined" },
  });
}

const router = (
  key: ResourceKey
): ((
  dispatch: (action: { type: AdminAction; payload: {} }) => void,
  data: unknown,
  state?: AdminState
) => void) =>
  ({
    [ResourceKey.Categories]: defaultImporter,
    [ResourceKey.Courses]: defaultImporter,
    [ResourceKey.Equipment]: defaultImporter,
    [ResourceKey.Events]: eventImport,
    [ResourceKey.Groups]: defaultImporter,
    [ResourceKey.Locations]: defaultImporter,
    [ResourceKey.Projects]: defaultImporter,
    [ResourceKey.Reservations]: defaultImporter,
    [ResourceKey.RosterRecords]: rosterImport,
    [ResourceKey.Semesters]: defaultImporter,
    [ResourceKey.Tags]: defaultImporter,
    [ResourceKey.Users]: defaultImporter,
    [ResourceKey.VirtualWeeks]: defaultImporter,
  }[key]);

export default router;
