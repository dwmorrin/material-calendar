import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Paper,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Grid,
} from "@material-ui/core";
import Pager, { getTotalPages } from "../Pager";
import { AdminUIProps, AdminAction } from "../../admin/types";
import { ResourceKey, ResourceInstance } from "../../resources/types";
import { Resources } from "../../resources/Resources";
import Record from "./records/Record";
import templateRouter from "./records/router";
import { dispatchFile } from "../../admin/dispatch";
import {
  DEFAULT_RECORD_HEIGHT,
  getRecordsPerPage,
} from "../../admin/documentBrowser";
import splitCamelCase from "../../utils/splitCamelCase";

const AdminDocumentBrowser: FunctionComponent<AdminUIProps> = ({
  dispatch,
  state,
}) => {
  const unfilteredRecords = state.resources[state.resourceKey];
  const [filter, setFilter] = useState("");
  const [recordHeight, setRecordHeight] = useState(DEFAULT_RECORD_HEIGHT);
  const [recordsPerPage, setRecordsPerPage] = useState(
    getRecordsPerPage(/*DEFAULT_RECORD_HEIGHT*/)
  );

  const [template, filterKey, filterFn] = templateRouter(state.resourceKey);
  const filteredRecords = unfilteredRecords.filter(filterFn(filter));

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
  const recordsForThisPage = filteredRecords.slice(
    page * recordsPerPage,
    page * recordsPerPage + recordsPerPage
  );
  const title = splitCamelCase(ResourceKey[state.resourceKey]);
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

  if (!recordsForThisPage) {
    return <CircularProgress />;
  }
  return (
    <Paper>
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      <Grid container spacing={4}>
        <Grid item>
          <Button onClick={handleNewDocument}>Create new {title}</Button>
        </Grid>
        <Grid item>
          <Typography variant="button">Bulk upload</Typography>
          <input
            type="file"
            name="file"
            accept=".txt,.csv,.tsv,text/plain,text/csv,text/tab-separated-values"
            onChange={dispatchFile(dispatch)}
          />
        </Grid>
        {!!filterKey && (
          <Grid item>
            <TextField
              placeholder={`Filter by ${filterKey}`}
              value={filter}
              onChange={(event): void => setFilter(event.target.value)}
            />
          </Grid>
        )}
      </Grid>
      {recordsForThisPage.length ? (
        recordsForThisPage.map((record: ResourceInstance, index) => (
          <Record
            key={index}
            dispatch={dispatch}
            document={record}
            template={template(record, state)}
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
        pages={getTotalPages(filteredRecords.length, recordsPerPage)}
        setPage={setPage}
      />
      <Button onClick={handleNextPage}>Next</Button>
    </Paper>
  );
};

export default AdminDocumentBrowser;
