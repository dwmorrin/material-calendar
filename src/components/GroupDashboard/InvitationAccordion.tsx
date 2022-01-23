import React, { FC } from "react";
import {
  Accordion,
  AccordionSummary,
  Badge,
  Divider,
  Grid,
  ListItem,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MailIcon from "@material-ui/icons/Mail";
import InvitationSent from "./InvitationSent";
import InvitationInboxItem from "./InvitationInboxItem";
import { InvitationListProps } from "./types";

const InvitationAccordion: FC<InvitationListProps> = ({
  currentProject,
  dispatch,
  myInvitation,
  pendingGroups,
  user,
  setProjectMembers,
}) => {
  const inbox = pendingGroups.filter(
    ({ members, exceptionalSize, creatorId }) => {
      const myself = members.find((member) => member.id === user.id);
      if (!myself) throw new Error("can't find you in your own group");
      const { accepted, rejected } = myself.invitation;
      return (
        (!accepted && !rejected) ||
        (Boolean(exceptionalSize) && creatorId !== user.id)
      );
    }
  );

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container justify="space-between">
          <Grid item>
            <Typography variant="body1">Pending Invitations</Typography>
          </Grid>
          <Grid item>
            <Badge badgeContent={pendingGroups.length} color="primary">
              <MailIcon />
            </Badge>
          </Grid>
        </Grid>
      </AccordionSummary>
      <Divider />
      <ListItem>
        <Typography>Sent</Typography>
      </ListItem>
      {myInvitation && (
        <InvitationSent
          dispatch={dispatch}
          project={currentProject}
          pendingGroup={myInvitation}
          user={user}
          setProjectMembers={setProjectMembers}
        />
      )}
      <Divider />
      <ListItem>
        <Typography>Inbox</Typography>
      </ListItem>
      {inbox.map((pendingGroup, i) => (
        <InvitationInboxItem
          key={`invitation-inbox-${i}`}
          pendingGroup={pendingGroup}
          dispatch={dispatch}
          user={user}
          project={currentProject}
          setProjectMembers={setProjectMembers}
        />
      ))}
    </Accordion>
  );
};

export default InvitationAccordion;
