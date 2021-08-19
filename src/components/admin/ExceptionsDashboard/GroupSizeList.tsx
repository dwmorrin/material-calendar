import React, { FC } from "react";
import {
  Button,
  ButtonGroup,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import UserGroup from "../../../resources/UserGroup";
import Project from "../../../resources/Project";
import { ResourceKey } from "../../../resources/types";
import { Mail, groupTo } from "../../../utils/mail";
import { Action, AdminAction, AdminState } from "../../../admin/types";

const GroupSizeList: FC<{
  groups: UserGroup[];
  dispatch: (a: Action) => void;
  state: AdminState;
}> = ({ dispatch, groups, state }) => {
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const approveGroupSize = (invitation: UserGroup, approve: boolean): void => {
    const approved = approve ? "approved" : "denied";
    const mail: Mail = {
      to: groupTo(invitation.members),
      subject: `Your group has been ${approved}`,
      text: [
        `You requested an irregular group size for ${invitation.projectTitle}`,
        `and it has been ${approved}.`,
      ].join(" "),
    };
    fetch(UserGroup.exceptionUrl.size(invitation), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve, mail }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        const groups: UserGroup[] = data.groups;
        if (!Array.isArray(groups))
          throw new Error("no updated groups sent back");
        dispatch({
          type: AdminAction.ReceivedResource,
          payload: {
            resources: {
              ...state.resources,
              [ResourceKey.Groups]: groups.map((g) => new UserGroup(g)),
            },
          },
          meta: ResourceKey.Groups,
        });
      })
      .catch((error) =>
        dispatch({ type: AdminAction.Error, payload: { error } })
      );
  };

  return (
    <List>
      {groups.map((group, i) => {
        const project = projects.find(({ id }) => id === group.projectId);
        if (!project) return <ListItem>Error: project not found.</ListItem>;
        return (
          <List key={`invitation${i}`}>
            <List>
              <ListItem>Members</ListItem>
              {group.members.map((invitee) => (
                <ListItem key={`invitation-${i}-invitee-${invitee.id}`}>
                  <ListItemText inset>
                    {invitee.name.first + " " + invitee.name.last}
                  </ListItemText>
                </ListItem>
              ))}
            </List>
            <Divider variant="middle" />
            <ListItem>
              <ListItemText>{project.title}</ListItemText>
            </ListItem>
            <ListItem>
              <Grid container>
                <Grid item xs={10} sm={3}>
                  <ListItemText>Project group size</ListItemText>
                </Grid>
                <Grid item xs={2}>
                  <ListItemText>{project.groupSize}</ListItemText>
                </Grid>
              </Grid>
            </ListItem>
            <ListItem>
              <Grid container>
                <Grid item xs={10} sm={3}>
                  <ListItemText>Requested group size</ListItemText>
                </Grid>
                <Grid item xs={2}>
                  <ListItemText>{group.members.length}</ListItemText>
                </Grid>
              </Grid>
            </ListItem>
            <ListItem>
              <ButtonGroup>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(): void => approveGroupSize(group, true)}
                >
                  Approve Exception
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={(): void => approveGroupSize(group, false)}
                >
                  Deny Exception
                </Button>
              </ButtonGroup>
            </ListItem>
          </List>
        );
      })}
    </List>
  );
};

export default GroupSizeList;
