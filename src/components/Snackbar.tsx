import React, { FC } from "react";
import { Snackbar, SnackbarContent, Button } from "@material-ui/core";
import DoneIcon from "@material-ui/icons/Done";
import ErrorIcon from "@material-ui/icons/Error";

const defaultSnackbarState = {
  type: "success",
  message: "",
  autoHideDuration: 0,
};

export type SnackbarState = {
  type: "success" | "failure";
  message: string;
  autoHideDuration: number | null;
};

interface SnackbarProps {
  state: { snackbarQueue: SnackbarState[] };
  dispatch: (action: { type: number }) => void;
  action: { type: number };
}

const SnackbarWrapper: FC<SnackbarProps> = ({ dispatch, state, action }) => {
  const snackbar = state.snackbarQueue[0];
  const { type, message, autoHideDuration } = snackbar || defaultSnackbarState;
  return (
    <Snackbar
      open={!!snackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      autoHideDuration={autoHideDuration}
      onClose={(): void => dispatch(action)}
    >
      <SnackbarContent
        message={message}
        action={
          <Button
            color="inherit"
            startIcon={type === "success" ? <DoneIcon /> : <ErrorIcon />}
            onClick={(): void => dispatch(action)}
          >
            Close
          </Button>
        }
      />
    </Snackbar>
  );
};

export default SnackbarWrapper;
