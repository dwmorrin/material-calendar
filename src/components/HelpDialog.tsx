import React, { FC } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
} from "@material-ui/core";
import DraggablePaper from "./DraggablePaper";
import { CalendarAction, CalendarUIProps } from "./types";
import { useAuth } from "./AuthProvider";

const HelpDialog: FC<CalendarUIProps> = ({ dispatch, state }) => {
  const { user } = useAuth();
  const defaultValue = "(not set)";
  const version = process.env.REACT_APP_COMMIT || defaultValue;
  const name =
    [user.name.first, user.name.middle, user.name.last]
      .filter(String)
      .join(" ") || defaultValue;

  const contactEmail = process.env.REACT_APP_ADMIN_EMAIL || "";
  const subject = encodeURIComponent(`${process.env.REACT_APP_APP_NAME} Help`);
  const body = encodeURIComponent(
    `\n\nName: ${name}\nUsername: ${user.username}\nApp version: ${version}`
  );

  const contactEmailHref = `mailto:${contactEmail}?subject=${subject}&body=${body}`;

  const close = (): void => dispatch({ type: CalendarAction.CloseHelpDialog });

  return (
    <Dialog
      open={state.helpDialogIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        Help
      </DialogTitle>
      <DialogContent>
        <List>
          <ListItem>Your name: {name}</ListItem>
          <ListItem>Your username: {user.username || defaultValue}</ListItem>
          <ListItem>Your email: {user.email || defaultValue}</ListItem>
          <ListItem>
            Support contact:{" "}
            {contactEmail ? (
              <a target="_blank" rel="noreferrer" href={contactEmailHref}>
                {contactEmail}
              </a>
            ) : (
              defaultValue
            )}
          </ListItem>
          <ListItem>
            App version: {process.env.REACT_APP_COMMIT || defaultValue}
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpDialog;
