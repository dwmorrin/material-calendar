import React, { FunctionComponent, useEffect, useReducer } from "react";
import { RouteComponentProps } from "@reach/router";
import { AdminAction } from "../../admin/types";
import { Resources } from "../../resources/types";
import reducer from "../../admin/reducer";
import initialState from "../../admin/initialState";
import AdminBar from "./Bar";
import AdminNavigationDrawer from "./NavigationDrawer";
import AdminDocumentBrowser from "./DocumentBrowser";
import AdminDetailsForm from "./DetailsForm";
import FileImport from "./FileImport";
import fetchAllResources from "../../utils/fetchAllResources";
import Scheduler from "./Scheduler";
import Backups from "./Backups";

const makeUrlsForAllResources = (): string[] =>
  Resources.map((resource, index) => `${resource.url}?context=${index}`);

const AdminDashboard: FunctionComponent<RouteComponentProps> = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    fetchAllResources(
      dispatch,
      AdminAction.ReceivedAllResources,
      AdminAction.Error,
      ...makeUrlsForAllResources()
    );
  }, []);

  return (
    <div>
      <AdminBar dispatch={dispatch} state={state} />
      <AdminNavigationDrawer dispatch={dispatch} state={state} />
      {state.schedulerIsOpen ? (
        <Scheduler dispatch={dispatch} state={state} />
      ) : (
        <AdminDocumentBrowser dispatch={dispatch} state={state} />
      )}
      <AdminDetailsForm dispatch={dispatch} state={state} />
      <FileImport dispatch={dispatch} state={state} />
      <Backups dispatch={dispatch} state={state} />
    </div>
  );
};

export default AdminDashboard;
