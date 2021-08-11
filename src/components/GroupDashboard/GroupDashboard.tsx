import React, { FC, useState, useEffect } from "react";
import {
  Dialog,
  Toolbar,
  IconButton,
  Typography,
  Paper,
  List,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { CalendarUIProps, CalendarAction } from "../../calendar/types";
import { makeTransition } from "../Transition";
import { parseAndFormatSQLDateInterval } from "../../utils/date";
import { useAuth } from "../AuthProvider";
import User from "../../resources/User";
import Project from "../../resources/Project";
import Invitation from "../../resources/Invitation";
import ConfirmationDialog from "./ConfirmationDialog";
import CurrentGroupBox from "./CurrentGroupBox";
import InvitationAccordion from "./InvitationAccordion";
import CreateNewGroupAccordion from "./CreateNewGroupAccordion";

const transition = makeTransition("right");

const GroupDashboard: FC<CalendarUIProps> = ({ state, dispatch }) => {
  const { currentGroup, currentProject } = state;
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [confirmationDialogIsOpen, openConfirmationDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { user } = useAuth();
  const invitations = state.invitations.filter(
    (invitation) => invitation.projectId === currentProject?.id
  );
  useEffect(() => {
    setSelectedUsers([]);
    if (!currentProject?.id) return;
    fetch(`${Project.url}/${currentProject.id}/users`)
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        if (!data) throw new Error("No project members received");
        setProjectMembers(data.map((user: User) => new User(user)) as User[]);
        fetch(`${Invitation.url}/user/${user?.id}`)
          .then((response) => response.json())
          .then(({ error, data }) => {
            if (error) throw error;
            if (!data) throw new Error("No invitations received");
            dispatch({
              type: CalendarAction.ReceivedInvitations,
              payload: {
                invitations: data,
              },
            });
          })
          .catch((error) =>
            dispatch({
              type: CalendarAction.Error,
              payload: { error },
            })
          );
      })
      .catch((error) =>
        dispatch({
          type: CalendarAction.Error,
          payload: { error },
        })
      );
  }, [currentProject, dispatch, state.currentGroup, user]);

  if (!currentProject) return null;

  return (
    <Dialog
      fullScreen
      TransitionComponent={transition}
      open={state.groupDashboardIsOpen}
    >
      <ConfirmationDialog
        state={state}
        dispatch={dispatch}
        open={confirmationDialogIsOpen}
        openConfirmationDialog={openConfirmationDialog}
        user={user}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
      />
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void => {
            dispatch({ type: CalendarAction.CloseGroupDashboard });
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography>{currentProject.title}</Typography>
      </Toolbar>
      <Paper
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <section>
          <Typography variant="body2">
            {parseAndFormatSQLDateInterval(currentProject)}
          </Typography>
        </section>
        <Typography variant="body1" style={{ marginLeft: 20, marginTop: 20 }}>
          {currentGroup ? "My Group" : "You are not in a Group"}
        </Typography>
        {currentGroup && (
          <CurrentGroupBox
            currentGroup={currentGroup}
            dispatch={dispatch}
            invitations={invitations}
            state={state}
            user={user}
          />
        )}
        <List>
          {invitations && (
            <InvitationAccordion
              dispatch={dispatch}
              invitations={invitations}
              currentProject={currentProject}
              user={user}
            />
          )}
        </List>
        {!currentGroup && (
          <CreateNewGroupAccordion
            defaultExpanded={!invitations}
            currentProject={currentProject}
            openConfirmationDialog={openConfirmationDialog}
            dispatch={dispatch}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            user={user}
            projectMembers={projectMembers}
          />
        )}
      </Paper>
    </Dialog>
  );
};

export default GroupDashboard;
