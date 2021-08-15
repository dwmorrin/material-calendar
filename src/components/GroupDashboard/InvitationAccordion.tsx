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
        .filter((invitation) => invitation.invitorId === user.id)
        .map((invitation, i) => (
          <InvitationSent
            key={`invitation${i}`}
            dispatch={dispatch}
            project={currentProject}
            invitation={invitation}
            user={user}
          />
        ))}
      {invitations
        .filter(
          (invitation) =>
            invitation.invitorId !== user.id &&
            (invitationIsPendingApproval(invitation) ||
              invitationIsUnanswered(invitation, user))
        )
        .map((invitation, i) => (
          <InvitationInboxItem
            key={`invitation${i}`}
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
