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
}) => {
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
      {myInvitation && (
        <>
          <ListItem>
            <Typography>Sent</Typography>
          </ListItem>
          <InvitationSent
            dispatch={dispatch}
            project={currentProject}
            pendingGroup={myInvitation}
            user={user}
          />
          <Divider />
        </>
      )}
      <ListItem>
        <Typography>Inbox</Typography>
      </ListItem>
      {pendingGroups
        .filter(({ members }) => {
          const me = members.find((member) => member.id === user.id);
          if (!me) throw new Error("can't find you in your own group");
          return !me.invitation.accepted && !me.invitation.rejected;
        })
        .map((pendingGroup, i) => (
          <InvitationInboxItem
            key={`invitation-inbox-${i}`}
            pendingGroup={pendingGroup}
            dispatch={dispatch}
            user={user}
            project={currentProject}
          />
        ))}
    </Accordion>
  );
};

export default InvitationAccordion;
