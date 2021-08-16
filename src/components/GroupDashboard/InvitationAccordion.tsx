import React, { FC } from "react";
import { Typography, Accordion, AccordionSummary } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
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
        <Typography variant="body1">Pending Invitations</Typography>
      </AccordionSummary>
      {myInvitation && (
        <>
          <Typography variant="body2">{"Sent invitation:"}</Typography>
          <InvitationSent
            dispatch={dispatch}
            project={currentProject}
            pendingGroup={myInvitation}
            user={user}
          />
        </>
      )}
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
