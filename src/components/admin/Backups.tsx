import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Dialog,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  Button,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import GetAppIcon from "@material-ui/icons/GetApp";
import WarningIcon from "@material-ui/icons/Warning";
import { AdminAction, AdminUIProps } from "../../admin/types";
import { prettyPrintFilename, restore, useStyles } from "../../admin/backups";
import { download } from "../../utils/download";

const Backups: FunctionComponent<AdminUIProps> = ({ dispatch, state }) => {
  const [backups, setBackups] = useState([] as string[]);
  const classes = useStyles();

  useEffect(() => {
    fetch("/api/backups")
      .then((response) => response.json())
      .then(({ data }) => setBackups(data))
      .catch(console.error);
  }, []);

  return (
    <Dialog fullScreen={true} open={state.backupsIsOpen}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void => dispatch({ type: AdminAction.CloseBackups })}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5">Database backups</Typography>
      </Toolbar>
      <List>
        <Button
          variant="contained"
          onClick={(): Promise<void> =>
            fetch(`/api/backups`, { method: "POST" })
              .then((response) => response.json())
              .then(({ error, data }) => {
                if (error || !data)
                  return dispatch({
                    type: AdminAction.Error,
                    payload: { error },
                  });
                setBackups(data);
              })
              .catch(console.error)
          }
        >
          Create a new backup
        </Button>
        {backups &&
          backups.map((filename) => (
            <ListItem className={classes.item} key={filename}>
              <Typography>{prettyPrintFilename(filename)}</Typography>
              <Button
                variant="contained"
                startIcon={<GetAppIcon />}
                onClick={(): Promise<void> =>
                  fetch(`/api/backups/${filename}`)
                    .then((response) => response.blob())
                    .then((blob) => download(blob, filename))
                    .catch(console.error)
                }
              >
                Download
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<WarningIcon />}
                onClick={(): Promise<void> => restore(filename)}
              >
                Restore
              </Button>
            </ListItem>
          ))}
      </List>
    </Dialog>
  );
};

export default Backups;
