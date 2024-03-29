import { CalendarState } from "./types";
import { enumKeys } from "../utils/enumKeys";
import { formatSQLDate } from "../utils/date";
import { ResourceKey, ResourceInstance } from "../resources/types";
import EventsByDate from "../resources/EventsByDate";

/**
 * coerce the ResourceKey enum into a dictionary to hold all our resources
 * enum => [0,1,...] => {0: [], 1: [], ...}
 */
const resources = {
  ...enumKeys(ResourceKey).map(() => [] as ResourceInstance[]),
} as unknown as { [k in ResourceKey]: ResourceInstance[] };

export const initialCalendarState: CalendarState = {
  appIsBroken: false,
  currentStart: formatSQLDate(),
  detailIsOpen: false,
  drawerIsOpen: false,
  eventEditorIsOpen: false,
  eventRange: { start: new Date(), end: new Date() },
  events: new EventsByDate([]),
  helpDialogIsOpen: false,
  groupDashboardIsOpen: false,
  initialResourcesPending: true,
  message: "",
  pickerShowing: false,
  projectDashboardIsOpen: false,
  projectFormIsOpen: false,
  ref: null,
  reservationFormIsOpen: false,
  reservationFormAdminIsOpen: false,
  resources,
  snackbarQueue: [],
  staffReservationFormIsOpen: false,
};
export default initialCalendarState;
