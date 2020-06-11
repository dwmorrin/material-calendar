import React, { FunctionComponent, useState, useEffect } from "react";
import {
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
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { csvParse, tsvParse } from "d3-dsv";
import { AdminAction, AdminUIProps } from "../../admin/types";
import { ResourceKey } from "../../resources/types";

const hasTabs = (s: string): boolean =>
  !!s
    .split("\n")
    .find((line) => line.length)
    ?.includes("\t");

const removeBlankLines = (s: string): string =>
  s
    .split("\n")
    .filter((line) => line.length)
    .join("\n");

const FileImport: FunctionComponent<AdminUIProps> = ({ dispatch, state }) => {
  const [delimiter, setDelimiter] = useState(",");
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(csvParse(""));

  useEffect(() => {
    if (typeof state.resourceFile !== "string") return;
    const file = removeBlankLines(state.resourceFile);
    const foundTabs = hasTabs(file);
    setText(file);
    setDelimiter(foundTabs ? "tab" : ",");
    setParsed(foundTabs ? tsvParse(file) : csvParse(file));
  }, [state.resourceFile]);
  return (
    <Dialog fullScreen={true} open={state.fileImportIsOpen}>
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
      <Typography variant="h6" component="h2">
        Headers
      </Typography>
      <pre>{JSON.stringify(parsed?.columns, null, 2)}</pre>
      <Typography variant="h6" component="h2">
        Records
      </Typography>
      <pre>{JSON.stringify(parsed, null, 2)}</pre>
      <TextField
        inputProps={{ style: { fontFamily: "monospace" } }}
        multiline
        variant="outlined"
        label="Edit"
        value={text}
        onChange={(event): void => {
          const { value } = event.target;
          setText(value);
          setParsed(delimiter === "," ? csvParse(value) : tsvParse(value));
        }}
      />
    </Dialog>
  );
};

export default FileImport;
