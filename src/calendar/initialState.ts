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
  detailIsOpen: false,
  drawerIsOpen: false,
  eventEditorIsOpen: false,
  groupDashboardIsOpen: false,
  initialResourcesPending: true,
  invitations: [],
  message: "",
  pickerShowing: false,
  projectDashboardIsOpen: false,
  projectFormIsOpen: false,
  ref: null,
  reservationFormIsOpen: false,
  resources,
  snackbarQueue: [],
};
export default initialCalendarState;
