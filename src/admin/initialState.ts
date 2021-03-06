import { AdminState } from "./types";
import { ResourceKey, ResourceInstance } from "../resources/types";
import { enumKeys } from "../utils/enumKeys";

/**
 * coerce the ResourceKey enum into a dictionary to hold all our resources
 * enum => [0,1,...] => {0: [], 1: [], ...}
 */
export const resources = {
  ...enumKeys(ResourceKey).map(() => [] as ResourceInstance[]),
} as unknown as { [k in ResourceKey]: ResourceInstance[] };

const initialState: AdminState = {
  // UI state
  projectLocationHoursDialogIsOpen: false,
  projectLocationHoursSummaryDialogIsOpen: false,
  appIsBroken: false,
  backupsIsOpen: false,
  detailIsOpen: false,
  drawerIsOpen: false,
  fileImportIsOpen: false,
  initialResourcesPending: true,
  locationHoursDialogIsOpen: false,
  recordPage: 0,
  ref: null,
  schedulerIsOpen: true,
  semesterDialogIsOpen: false,
  snackbarQueue: [],
  virtualWeeksDialogIsOpen: false,
  virtualWeekModifyDialogIsOpen: false,

  // resources
  resourceKey: ResourceKey.Users,
  resources,
};

export default initialState;
