import React, { FunctionComponent, useEffect, useState } from "react";
import { Paper, Typography, CircularProgress, Button } from "@material-ui/core";
import Pager, { getTotalPages } from "../Pager";
import { AdminUIProps, AdminAction } from "../../admin/types";
import { ResourceKey, ResourceInstance } from "../../resources/types";
import { Resources } from "../../resources/Resources";
import Record from "./Record";
import templateRouter from "../../admin/records/router";
import { dispatchFile } from "../../admin/dispatch";
import {
  DEFAULT_RECORD_HEIGHT,
  getRecordsPerPage,
} from "../../admin/documentBrowser";

const AdminDocumentBrowser: FunctionComponent<AdminUIProps> = ({
  dispatch,
  state,
}) => {
  const [recordHeight, setRecordHeight] = useState(DEFAULT_RECORD_HEIGHT);
  const [recordsPerPage, setRecordsPerPage] = useState(
    getRecordsPerPage(/*DEFAULT_RECORD_HEIGHT*/)
  );

  useEffect(() => {
    const calculateAndSetRecordsPerPage = (): void => {
      setRecordsPerPage(getRecordsPerPage(/*recordHeight*/));
    };
    window.addEventListener("resize", calculateAndSetRecordsPerPage);
    return (): void =>
      window.removeEventListener("resize", calculateAndSetRecordsPerPage);
  }, [recordHeight]);

  useEffect(() => {
    const height =
      document.querySelector(".MuiCard-root")?.clientHeight ||
      DEFAULT_RECORD_HEIGHT;
    setRecordHeight(height);
    setRecordsPerPage(getRecordsPerPage(/*height*/));
  }, []);

  const { recordPage: page } = state;
  const setPage = (page: number): void =>
    dispatch({
      type: AdminAction.SelectedRecordPage,
      payload: { recordPage: page },
    });
  const resources = state.resources[state.resourceKey].slice(
    page * recordsPerPage,
    page * recordsPerPage + recordsPerPage
  );
  const title = ResourceKey[state.resourceKey];
  const handleNewDocument = (): void =>
    dispatch({
      type: AdminAction.SelectedDocument,
      payload: {
        resourceInstance: new Resources[state.resourceKey](),
      },
    });

  const handlePreviousPage = (): void => setPage(page > 0 ? page - 1 : page);

  const handleNextPage = (): void =>
    setPage(
      (page + 1) * recordsPerPage >= state.resources[state.resourceKey].length
        ? page
        : page + 1
    );

  if (!resources) {
    return <CircularProgress />;
  }
  return (
    <Paper>
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      <Button onClick={handleNewDocument}>Create new {title}</Button>
      <Typography variant="body2">Bulk upload:</Typography>
      <input
        type="file"
        name="file"
        accept=".txt,.csv,.tsv,text/plain,text/csv,text/tab-separated-values"
        onChange={dispatchFile(dispatch)}
      />
      {resources.length ? (
        resources.map((record: ResourceInstance, index) => (
          <Record
            key={index}
            dispatch={dispatch}
            document={record}
            template={templateRouter(state.resourceKey)(record)}
          />
        ))
      ) : (
        <p>
          Nothing found for {title}.<br />
          <Button onClick={handleNewDocument}>Create something!</Button>
        </p>
      )}
      <Button onClick={handlePreviousPage}>Prev</Button>
      <Pager
        page={page}
        pages={getTotalPages(
          state.resources[state.resourceKey].length,
          recordsPerPage
        )}
        setPage={setPage}
      />
      <Button onClick={handleNextPage}>Next</Button>
    </Paper>
  );
};

export default AdminDocumentBrowser;
