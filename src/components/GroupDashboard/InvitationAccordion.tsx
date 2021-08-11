import React, { FC } from "react";
import { Typography, Accordion, AccordionSummary } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  invitationIsPendingApproval,
  invitationIsUnanswered,
} from "../../resources/Invitation";
import InvitationSent from "./InvitationSent";
import InvitationInboxItem from "./InvitationInboxItem";
import { InvitationListProps } from "./types";

const InvitationAccordion: FC<InvitationListProps> = ({
  dispatch,
  invitations,
  currentProject,
  user,
}) => {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body1">Pending Invitations</Typography>
      </AccordionSummary>
      {invitations
        .filter((invitation) => invitation.invitor.id === user.id)
        .map((invitation) => (
          <InvitationSent
            key={`invitation${invitation.id}`}
            dispatch={dispatch}
            project={currentProject}
            invitation={invitation}
            user={user}
          />
        ))}
      {invitations
        .filter(
          (invitation) =>
            invitation.invitor.id !== user.id &&
            (invitationIsPendingApproval(invitation) ||
              invitationIsUnanswered(invitation, user))
        )
        .map((invitation) => (
          <InvitationInboxItem
            key={`invitation${invitation.id}`}
            invitation={invitation}
            dispatch={dispatch}
            user={user}
            project={currentProject}
          />
        ))}
    </Accordion>
  );
};

export default InvitationAccordion;
