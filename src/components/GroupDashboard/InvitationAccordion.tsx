import React, { FC } from "react";
import { Typography, Accordion, AccordionSummary } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CalendarUIProps } from "../../calendar/types";
import User from "../../resources/User";
import Project from "../../resources/Project";
import Invitation, {
  invitationIsPendingApproval,
  invitationIsUnanswered,
} from "../../resources/Invitation";
import InvitationSent from "./InvitationSent";
import InvitationInboxItem from "./InvitationInboxItem";

const InvitationAccordion: FC<
  CalendarUIProps & {
    currentProject: Project;
    invitations: Invitation[];
    user: User;
  }
> = ({ dispatch, invitations, currentProject, user }) => {
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
            currentProject={currentProject}
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
            currentProject={currentProject}
          />
        ))}
    </Accordion>
  );
};

export default InvitationAccordion;
