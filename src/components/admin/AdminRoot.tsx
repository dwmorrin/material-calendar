import React, { FunctionComponent, useEffect, useReducer, useRef } from "react";
import { RouteComponentProps } from "@reach/router";
import { AdminAction, AdminSelections } from "./types";
import { Resources } from "../../resources/Resources";
import reducer from "./reducer";
import initialState from "./initialState";
import Bar from "./Bar";
import NavigationDrawer from "./NavigationDrawer";
import DocumentBrowser from "./DocumentBrowser";
import DetailsForm from "./DetailsForm";
import FileImport from "./bulkImport/FileImport";
import fetchAllResources from "../../utils/fetchAllResources";
import useLocalStorage from "../../utils/useLocalStorage";
import Scheduler from "./Scheduler/Scheduler";
import Backups from "./Backups/Backups";
import { useAuth } from "../AuthProvider";
import { Redirect } from "@reach/router";
import SemesterDialog from "./SemesterDialog";
import AddProjectToLocationDialog from "./AddProjectToLocationDialog";
import ProjectLocationHoursDialog from "./ProjectLocationHoursDialog";
import ProjectLocationHoursSummaryDialog from "./ProjectLocationHoursSummaryDialog";
import LocationHoursDialog from "./LocationHoursDialog/LocationHoursDialog";
import VirtualWeekModifyDialog from "./VirtualWeekModifyDialog";
import Snackbar from "../Snackbar";
import FullCalendar from "@fullcalendar/react";
import ErrorPage from "../ErrorPage";
import { CircularProgress } from "@material-ui/core";
import ExceptionsDashboard from "./ExceptionsDashboard/ExceptionsDashboard";
import { ResourceKey } from "../../resources/types";
import Reservation from "../../resources/Reservation";
import Semester from "../../resources/Semester";
import UserGroup from "../../resources/UserGroup";
import ProjectDashboard from "./ProjectDashboard";
import ImportClassMeetings from "./ImportClassMeetings";
import ImportRoster from "./ImportRoster";
import AppInspectionDialog from "./AppInspectionDialog";

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
      let selectedSemester: Semester | undefined;
      // check selections
      if (selections.semesterId > 0)
        selectedSemester = semesters.find(
          ({ id }) => id === selections.semesterId
        );
      // check most recent
      if (!selectedSemester && semesters.length)
        selectedSemester = semesters.reduce(mostRecent);
      if (selectedSemester) {
        if (selectedSemester.id !== selections.semesterId)
          setSelections({ ...selections, semesterId: selectedSemester.id });
        dispatch({
          type: AdminAction.SelectedSemester,
          payload: { selectedSemester },
        });
      }
      // else there are no semesters to choose from
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
      <ImportClassMeetings dispatch={dispatch} state={state} />
      <ImportRoster dispatch={dispatch} state={state} />
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
      <AppInspectionDialog dispatch={dispatch} state={state} />
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
