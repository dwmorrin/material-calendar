import React, { FC, useState, useEffect } from "react";
import {
  Dialog,
  IconButton,
  List,
  Paper,
  Toolbar,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { CalendarUIProps, CalendarAction } from "../types";
import { makeTransition } from "../Transition";
import { parseAndFormatSQLDateInterval } from "../../utils/date";
import { useAuth } from "../AuthProvider";
import User from "../../resources/User";
import UserGroup from "../../resources/UserGroup";
import Project from "../../resources/Project";
import ConfirmationDialog from "./ConfirmationDialog";
import CurrentGroupBox from "./CurrentGroupBox";
import InvitationAccordion from "./InvitationAccordion";
import CreateNewGroupAccordion from "./CreateNewGroupAccordion";
import ProjectMembers from "./ProjectMembers";
import { ResourceKey } from "../../resources/types";

const transition = makeTransition("right");

const GroupDashboard: FC<CalendarUIProps> = ({ state, dispatch }) => {
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [confirmationDialogIsOpen, openConfirmationDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { user } = useAuth();

  const { currentGroup, currentProject } = state;

  useEffect(() => {
    setSelectedUsers([]);
    if (!currentProject?.id) return;
    fetch(`${Project.url}/${currentProject.id}/group-dashboard`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then(({ error, data }) => {
        if (error) throw error;
        const users: User[] = data;
        if (!Array.isArray(users))
          throw new Error("No project member info received");
        setProjectMembers(users.map((u: User) => new User(u)));
      })
      .catch((error) =>
        dispatch({
          type: CalendarAction.Error,
          payload: { error },
        })
      );
  }, [currentProject, dispatch, state.currentGroup, user]);

  if (!currentProject) return null;

  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const invitations = groups.filter(
    ({ projectId, pending }) => pending && projectId === currentProject.id
  );

  // rule: can only send 1 invite at a time
  const myInvitation = invitations.find(
    ({ creatorId }) => creatorId === user.id
  );

  return (
    <Dialog
      fullScreen
      TransitionComponent={transition}
      open={state.groupDashboardIsOpen}
    >
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
        {currentGroup ? (
          <CurrentGroupBox
            group={currentGroup}
            project={currentProject}
            dispatch={dispatch}
            user={user}
            setProjectMembers={setProjectMembers}
          />
        ) : (
          <>
            <List>
              {!!invitations.length && (
                <InvitationAccordion
                  currentProject={currentProject}
                  dispatch={dispatch}
                  myInvitation={myInvitation}
                  pendingGroups={invitations}
                  user={user}
                  setProjectMembers={setProjectMembers}
                />
              )}
              {!myInvitation && (
                <CreateNewGroupAccordion
                  defaultExpanded={!invitations}
                  project={currentProject}
                  openConfirmationDialog={openConfirmationDialog}
                  dispatch={dispatch}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  user={user}
                  projectMembers={projectMembers}
                  setProjectMembers={setProjectMembers}
                />
              )}
              <ProjectMembers projectMembers={projectMembers} />
            </List>
            <ConfirmationDialog
              dispatch={dispatch}
              open={confirmationDialogIsOpen}
              openConfirmationDialog={openConfirmationDialog}
              project={currentProject}
              setProjectMembers={setProjectMembers}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              user={user}
            />
          </>
        )}
      </Paper>
    </Dialog>
  );
};

export default GroupDashboard;
