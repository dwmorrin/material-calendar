import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Button,
  Container,
  Dialog,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { AdminUIProps, AdminAction } from "./types";
import { ResourceKey } from "../../resources/types";
import { dispatchFile } from "./dispatch";
import { BulkImporter } from "./bulkImport/router";

import CloseIcon from "@material-ui/icons/Close";
import { csvParse, tsvParse } from "d3-dsv";
import Reservation from "../../resources/Reservation";

interface InputRow {
  title: string;
  locationId: string;
  start: string;
  end: string;
  reservable: number;
  course: string;
  section: string;
}

const headings = [
  "title",
  "locationId",
  "start",
  "end",
  "reservable",
  "course",
  "section",
];

const onSubmit: BulkImporter = (setSubmitting, dispatch, records) => {
  const dispatchError = (error: Error): void => {
    setSubmitting(false);
    dispatch({ type: AdminAction.Error, payload: { error } });
  };
  if (!Array.isArray(records))
    return dispatchError(
      new Error("Import failed, could not parse input as an array")
    );

  const body = JSON.stringify(
    records.map((record) => ({
      locationId: record.locationId,
      course: record.course,
      section: record.section,
      start: record.start,
    }))
  );

  fetch(`${Reservation.url}/import-class-meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
    .then((res) => res.json())
    .then(({ error, data }) => {
      if (error) throw error;
      setSubmitting(false);
      dispatch({
        type: AdminAction.FileImportSuccess,
        payload: {
          resources: {
            [ResourceKey.Courses]: (data as Reservation[]).map(
              (r) => new Reservation(r)
            ),
          },
        },
      });
    })
    .catch(dispatchError);
};

const useStyles = makeStyles({
  scrollable: {
    border: "1px solid black",
    paddingTop: 15,
    height: "33%",
    overflow: "scroll",
  },
});

const hasTabs = (s: string): boolean =>
  !!s.split("\n").find(String)?.includes("\t");

const blankLine = /^\s*$/;

const removeBlankLines = (s: string): string =>
  s
    .split("\n")
    .filter((l) => !blankLine.test(l))
    .join("\n");

const ImportClassMeetings: FunctionComponent<AdminUIProps> = ({
  dispatch,
  state,
}) => {
  const [delimiter, setDelimiter] = useState(",");
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(csvParse(""));
  const [submitting, setSubmitting] = useState(false);
  const classes = useStyles();
  useEffect(() => {
    if (typeof state.resourceFile !== "string") return;
    const file = removeBlankLines(state.resourceFile);
    const foundTabs = hasTabs(file);
    const IFS = foundTabs ? "\t" : ",";
    setText(file);
    setDelimiter(foundTabs ? "tab" : ",");
    const withHeaders = headings.join(IFS) + "\n" + file;
    setParsed(foundTabs ? tsvParse(withHeaders) : csvParse(withHeaders));
  }, [state.resourceFile]);

  return (
    <Dialog fullScreen open={state.importClassMeetingsIsOpen}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: AdminAction.CloseImportClassMeetingDialog })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5">Import Class Meetings</Typography>
      </Toolbar>
      <Paper>
        <Grid container spacing={4}>
          <Grid item>
            <Typography variant="button">Bulk upload</Typography>
            <input
              type="file"
              name="file"
              accept=".txt,.csv,.tsv,text/plain,text/csv,text/tab-separated-values"
              onChange={dispatchFile(
                dispatch,
                AdminAction.OpenedClassMeetingsFile
              )}
            />
          </Grid>
        </Grid>
      </Paper>
      <FormControl>
        <FormLabel>Set field delimiter (comma or tab)</FormLabel>
        <RadioGroup
          aria-label="delimiter"
          name="delimiter"
          value={delimiter}
          onChange={(event): void => {
            const { value } = event.target;
            setDelimiter(value);
            setParsed(value === "," ? csvParse(text) : tsvParse(text));
          }}
        >
          <FormControlLabel value="," control={<Radio />} label="Comma" />
          <FormControlLabel value="tab" control={<Radio />} label="Tab" />
        </RadioGroup>
      </FormControl>
      <FormLabel>
        Review the records and submit if everything looks OK
      </FormLabel>
      <Button
        variant="contained"
        disabled={submitting}
        onClick={(): void => {
          setSubmitting(true);
          onSubmit(setSubmitting, dispatch, parsed, state);
        }}
      >
        Submit
      </Button>
      <Typography variant="h6" component="h2">
        Headers
      </Typography>
      <Container>
        <pre>{parsed ? parsed.columns.join(", ") : ""}</pre>
      </Container>
      <Typography variant="h6" component="h2">
        Records
      </Typography>
      <Container className={classes.scrollable}>
        <pre>{JSON.stringify(parsed, null, 2)}</pre>
      </Container>
      <Typography variant="h6" component="h2">
        Edit
      </Typography>
      <Container className={classes.scrollable}>
        <TextField
          inputProps={{ style: { fontFamily: "monospace" } }}
          fullWidth
          multiline
          value={text}
          onChange={(event): void => {
            const { value } = event.target;
            setText(value);
            const withHeaders =
              headings.join(delimiter === "," ? "," : "\t") + "\n" + value;
            setParsed(
              delimiter === "," ? csvParse(withHeaders) : tsvParse(withHeaders)
            );
          }}
        />
      </Container>
    </Dialog>
  );
};

export default ImportClassMeetings;
