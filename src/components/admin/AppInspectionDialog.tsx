import React, { FC } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import DraggablePaper from "../DraggablePaper";
import { AdminUIProps, AdminAction } from "./types";

const AppInspectionDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const close = (): void => dispatch({ type: AdminAction.CloseAppInspection });

  return (
    <Dialog
      open={state.appInspectionIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        App Inspection
      </DialogTitle>
      <DialogContent>
        <Typography variant="h5">Build Options</Typography>
        <pre>{JSON.stringify(process.env, null, 2)}</pre>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppInspectionDialog;
