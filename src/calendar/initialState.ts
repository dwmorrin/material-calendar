import { CalendarState } from "./types";
import { enumKeys } from "../utils/enumKeys";
import { ResourceKey, ResourceInstance } from "../resources/types";

/**
 * coerce the ResourceKey enum into a dictionary to hold all our resources
 * enum => [0,1,...] => {0: [], 1: [], ...}
 */
const resources = {
  ...enumKeys(ResourceKey).map(() => [] as ResourceInstance[]),
} as unknown as { [k in ResourceKey]: ResourceInstance[] };

export const initialCalendarState: CalendarState = {
  appIsBroken: false,
  currentStart: new Date(),
  currentView: "resourceTimeGridDay",
  detailIsOpen: false,
  drawerIsOpen: false,
  message: "",
  eventEditorIsOpen: false,
  groupDashboardIsOpen: false,
  reservationFormIsOpen: false,
  projectFormIsOpen: false,
  initialResourcesPending: true,
  pickerShowing: false,
  projectDashboardIsOpen: false,
  resources,
  ref: null,
  snackbarQueue: [],
};
export default initialCalendarState;
