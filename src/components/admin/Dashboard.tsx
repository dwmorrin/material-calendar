import React, {
  FunctionComponent,
  useEffect,
  useReducer,
  useContext,
  useRef,
} from "react";
import { RouteComponentProps } from "@reach/router";
import { AdminAction } from "../../admin/types";
import { Resources } from "../../resources/Resources";
import reducer from "../../admin/reducer";
import initialState from "../../admin/initialState";
import Bar from "./Bar";
import NavigationDrawer from "./NavigationDrawer";
import DocumentBrowser from "./DocumentBrowser";
import DetailsForm from "./DetailsForm";
import FileImport from "./FileImport";
import fetchAllResources from "../../utils/fetchAllResources";
import Scheduler from "./Scheduler";
import Backups from "./Backups";
import { AuthContext } from "../AuthContext";
import { Redirect } from "@reach/router";
import User from "../../resources/User";
import SemesterDialog from "./SemesterDialog";
import ProjectLocationHoursDialog from "./ProjectLocationHoursDialog";
import ProjectLocationHoursSummaryDialog from "./ProjectLocationHoursSummaryDialog";
import LocationHoursDialog from "./LocationHoursDialog";
import VirtualWeeksDialog from "./VirtualWeeksDialog";
import VirtualWeekModifyDialog from "./VirtualWeekModifyDialog";
import Snackbar from "../Snackbar";
import FullCalendar from "@fullcalendar/react";
import ErrorPage from "../ErrorPage";
import { CircularProgress } from "@material-ui/core";

const makeUrlsForAllResources = (): string[] =>
  Resources.map((resource, index) => `${resource.url}?context=${index}`);

const AdminDashboard: FunctionComponent<RouteComponentProps> = () => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ref: useRef<FullCalendar>(null),
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAllResources(
      dispatch,
      AdminAction.ReceivedAllResources,
      AdminAction.Error,
      ...makeUrlsForAllResources()
    );
  }, []);

  if (process.env.NODE_ENV !== "development" && !User.isAdmin(user)) {
    return <Redirect to="/" replace={true} noThrow={true} />;
  }
  if (state.initialResourcesPending) return <CircularProgress />;
  return (
    <div>
      <Bar dispatch={dispatch} state={state} />
      <NavigationDrawer dispatch={dispatch} state={state} />
      {state.schedulerIsOpen ? (
        <Scheduler dispatch={dispatch} state={state} />
      ) : (
        <DocumentBrowser dispatch={dispatch} state={state} />
      )}
      <DetailsForm dispatch={dispatch} state={state} />
      <FileImport dispatch={dispatch} state={state} />
      <Backups dispatch={dispatch} state={state} />
      <SemesterDialog dispatch={dispatch} state={state} />
      <ProjectLocationHoursDialog dispatch={dispatch} state={state} />
      <ProjectLocationHoursSummaryDialog dispatch={dispatch} state={state} />
      <LocationHoursDialog dispatch={dispatch} state={state} />
      <VirtualWeeksDialog dispatch={dispatch} state={state} />
      <VirtualWeekModifyDialog dispatch={dispatch} state={state} />
      <ErrorPage open={state.appIsBroken} error={state.error} />
      <Snackbar
        dispatch={dispatch}
        state={state}
        action={{ type: AdminAction.CloseSnackbar }}
      />
    </div>
  );
};

export default AdminDashboard;
