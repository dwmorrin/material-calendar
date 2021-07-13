import React, { FunctionComponent, useState, useEffect } from "react";
import {
  Container,
  Dialog,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  makeStyles,
  Button,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { csvParse, tsvParse } from "d3-dsv";
import { AdminAction, AdminUIProps } from "../../admin/types";
import { ResourceKey } from "../../resources/types";
import importRouter from "../../admin/bulkImport/router";

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

const FileImport: FunctionComponent<AdminUIProps> = ({ dispatch, state }) => {
  const [delimiter, setDelimiter] = useState(",");
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(csvParse(""));
  const classes = useStyles();
  const [headings, onSubmit] = importRouter(state.resourceKey);

  useEffect(() => {
    if (typeof state.resourceFile !== "string") return;
    const file = removeBlankLines(state.resourceFile);
    const foundTabs = hasTabs(file);
    const IFS = foundTabs ? "\t" : ",";
    setText(file);
    setDelimiter(foundTabs ? "tab" : ",");
    const withHeaders = headings.join(IFS) + "\n" + file;
    setParsed(foundTabs ? tsvParse(withHeaders) : csvParse(withHeaders));
  }, [state.resourceFile, headings]);

  return (
    <Dialog fullScreen open={state.fileImportIsOpen}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void => dispatch({ type: AdminAction.CloseFileImport })}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5">{`Import file for ${
          ResourceKey[state.resourceKey]
        }`}</Typography>
      </Toolbar>
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
        onClick={(): void => onSubmit(dispatch, parsed, state)}
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

export default FileImport;
