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
import { AdminAction, AdminUIProps } from "../../admin/types";
import { prettyPrintFilename } from "../../admin/backups";
import { download } from "../../utils/download";

const Backups: FunctionComponent<AdminUIProps> = ({ dispatch, state }) => {
  const [backups, setBackups] = useState([] as string[]);

  useEffect(() => {
    fetch("/api/backup")
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
      <Button
        onClick={(): Promise<void> =>
          fetch(`/api/backup`, { method: "POST" })
            .then((response) => response.json())
            .then(({ data }) => setBackups(data))
            .catch(console.error)
        }
      >
        Create a new backup
      </Button>
      <Typography>Available backups</Typography>
      <List>
        {backups.map((filename) => (
          <ListItem
            button
            onClick={(): Promise<void> =>
              fetch(`/api/backup/${filename}`)
                .then((response) => response.blob())
                .then((blob) => download(blob, filename))
                .catch(console.error)
            }
            key={filename}
          >
            {prettyPrintFilename(filename)}
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default Backups;
