import React, { FunctionComponent, useEffect, useReducer, useRef } from "react";
import { RouteComponentProps } from "@reach/router";
import { AdminAction, AdminSelections } from "../../admin/types";
import { Resources } from "../../resources/Resources";
import reducer from "../../admin/reducer";
import initialState from "../../admin/initialState";
import Bar from "./Bar";
import NavigationDrawer from "./NavigationDrawer";
import DocumentBrowser from "./DocumentBrowser";
import DetailsForm from "./DetailsForm";
import FileImport from "./FileImport";
import fetchAllResources from "../../utils/fetchAllResources";
import useLocalStorage from "../../utils/useLocalStorage";
import Scheduler from "./Scheduler";
import Backups from "./Backups";
import { useAuth } from "../AuthProvider";
import { Redirect } from "@reach/router";
import SemesterDialog from "./SemesterDialog";
import AddProjectToLocationDialog from "./AddProjectToLocationDialog";
import ProjectLocationHoursDialog from "./ProjectLocationHoursDialog";
import ProjectLocationHoursSummaryDialog from "./ProjectLocationHoursSummaryDialog";
import LocationHoursDialog from "./LocationHoursDialog";
import VirtualWeekModifyDialog from "./VirtualWeekModifyDialog";
import Snackbar from "../Snackbar";
import FullCalendar from "@fullcalendar/react";
import ErrorPage from "../ErrorPage";
import { CircularProgress } from "@material-ui/core";
import ExceptionsDashboard from "./ExceptionsDashboard";
import { ResourceKey } from "../../resources/types";
import Reservation from "../../resources/Reservation";
import Semester from "../../resources/Semester";
import UserGroup from "../../resources/UserGroup";
import ProjectDashboard from "./ProjectDashboard";

const makeUrlsForAllResources = (): string[] =>
  Resources.map((resource, index) => `${resource.url}?context=${index}`);

const mostRecent = (a: Semester, b: Semester): Semester =>
  new Date(b.start).valueOf() - new Date(a.start).valueOf() < 0 ? a : b;

const AdminDashboard: FunctionComponent<RouteComponentProps> = () => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ref: useRef<FullCalendar>(null),
  });
  const { isAdmin } = useAuth();
  const [selections, setSelections] = useLocalStorage("admin-selections", {
    locationId: -1,
    semesterId: -1,
  } as AdminSelections);

  // try to set the current semester
  useEffect(() => {
    if (!state.initialResourcesPending && !state.selectedSemester) {
      const semesters = state.resources[ResourceKey.Semesters] as Semester[];
      // try to use the user's selected semesterId, or the most recent semester
      const selectedSemester =
        selections.semesterId > 0
          ? semesters.find(({ id }) => id === selections.semesterId)
          : semesters.length
          ? semesters.reduce(mostRecent)
          : null;
      if (selectedSemester) {
        if (selectedSemester.id !== selections.semesterId)
          setSelections({ ...selections, semesterId: selectedSemester.id });
        dispatch({
          type: AdminAction.SelectedSemester,
          payload: { selectedSemester },
        });
      }
    }
  }, [
    dispatch,
    selections,
    setSelections,
    state.initialResourcesPending,
    state.resources,
    state.selectedSemester,
  ]);

  useEffect(() => {
    if (isAdmin)
      fetchAllResources(
        dispatch,
        AdminAction.ReceivedAllResources,
        AdminAction.Error,
        ...makeUrlsForAllResources()
      );
  }, [isAdmin]);

  if (!isAdmin) {
    return <Redirect to="/" replace={true} noThrow={true} />;
  }

  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const reservations = state.resources[
    ResourceKey.Reservations
  ] as Reservation[];
  const exceptions = {
    groupSize: groups.filter(
      ({ pending, exceptionalSize }) => pending && exceptionalSize
    ),
    refunds: reservations.filter(Reservation.hasPendingRefundRequest),
  };
  const exceptionCount =
    exceptions.groupSize.length + exceptions.refunds.length;

  if (state.initialResourcesPending) return <CircularProgress />;
  return (
    <div>
      <Bar dispatch={dispatch} state={state} exceptionCount={exceptionCount} />
      <NavigationDrawer
        dispatch={dispatch}
        state={state}
        selections={selections}
        setSelections={setSelections}
        exceptionCount={exceptionCount}
      />
      {state.schedulerIsOpen ? (
        <Scheduler
          dispatch={dispatch}
          state={state}
          selections={selections}
          setSelections={setSelections}
        />
      ) : (
        <DocumentBrowser dispatch={dispatch} state={state} />
      )}
      <DetailsForm dispatch={dispatch} state={state} />
      <FileImport dispatch={dispatch} state={state} />
      <ProjectDashboard dispatch={dispatch} state={state} />
      <Backups dispatch={dispatch} state={state} />
      <SemesterDialog
        dispatch={dispatch}
        state={state}
        selections={selections}
        setSelections={setSelections}
      />
      <AddProjectToLocationDialog
        dispatch={dispatch}
        state={state}
        selections={selections}
        setSelections={setSelections}
      />
      {state.exceptionsDashboardIsOpen && (
        <ExceptionsDashboard
          dispatch={dispatch}
          state={state}
          exceptions={exceptions}
        />
      )}
      <ProjectLocationHoursDialog dispatch={dispatch} state={state} />
      <ProjectLocationHoursSummaryDialog
        dispatch={dispatch}
        state={state}
        selections={selections}
        setSelections={setSelections}
      />
      <LocationHoursDialog dispatch={dispatch} state={state} />
      <VirtualWeekModifyDialog
        dispatch={dispatch}
        state={state}
        selections={selections}
        setSelections={setSelections}
      />
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
