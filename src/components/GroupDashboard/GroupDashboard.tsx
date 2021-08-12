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
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [confirmationDialogIsOpen, openConfirmationDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { user } = useAuth();

  const { currentGroup, currentProject } = state;

  const invitations = state.invitations.filter(
    ({ projectId }) => projectId === currentProject?.id
  );

  useEffect(() => {
    setSelectedUsers([]);
    if (!currentProject?.id) return;
    fetch(`${Project.url}/${currentProject.id}/group-dashboard`)
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        if (!data) throw new Error("No project info received");
        const { users, invitations } = data;
        if (!Array.isArray(users))
          throw new Error("No project member info received");
        if (!Array.isArray(invitations))
          throw new Error("No invitation info received");
        setProjectMembers(
          (users as User[]).map((user: User) => new User(user))
        );
        dispatch({
          type: CalendarAction.ReceivedInvitations,
          payload: {
            invitations: invitations.map((i) => new Invitation(i)),
          },
        });
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
        dispatch={dispatch}
        open={confirmationDialogIsOpen}
        openConfirmationDialog={openConfirmationDialog}
        project={currentProject}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        user={user}
      />
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseGroupDashboard })
          }
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
            group={currentGroup}
            project={currentProject}
            dispatch={dispatch}
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
            project={currentProject}
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
