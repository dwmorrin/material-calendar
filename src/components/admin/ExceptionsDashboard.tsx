import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Dialog,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  Button,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  Paper,
  CircularProgress,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { AdminAction, AdminUIProps } from "../../admin/types";
import UserGroup from "../../resources/UserGroup";
import Reservation from "../../resources/Reservation";
import { formatDatetimeSeconds, parseSQLDatetime } from "../../utils/date";
import { Mail, groupTo } from "../../utils/mail";

interface Invitee {
  id: number;
  accepted: boolean;
  rejected: boolean;
  name: { last: string; first: string };
  email: string;
}
interface Invitation {
  confirmed: boolean;
  projectId: number;
  invitorId: number;
  invitees: Invitee[];
  groupId: number;
  approvedId: number;
  deniedId: number;
}

interface HagenReservation extends Reservation {
  event: {
    start: string;
    end: string;
    location: string;
  };
  projectTitle: string;
  members: {
    id: number;
    name: { first: string; last: string };
    email: string;
    username: string;
  }[];
}

interface HagenInvitation extends Invitation {
  projectTitle: string;
  projectGroupSize: number;
}

const ExceptionsDashboard: FunctionComponent<AdminUIProps> = ({
  dispatch,
  state,
}) => {
  const [invitations, setInvitations] = useState<HagenInvitation[]>([]);
  const [reservations, setReservations] = useState<HagenReservation[]>([]);

  const [invitationsAreLoading, setInvitationsAreLoading] = useState(true);
  const [reservationsAreLoading, setReservationsAreLoading] = useState(true);

  useEffect(() => {
    const dispatchError = (error: Error): void =>
      dispatch({ type: AdminAction.Error, payload: { error } });
    fetch(`${UserGroup.url}/admin/exceptions`)
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        setInvitations(data);
        setInvitationsAreLoading(false);
      })
      .catch(dispatchError);
    fetch(`${Reservation.url}/admin/exceptions`)
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        setReservations(data);
        setReservationsAreLoading(false);
      })
      .catch(dispatchError);
  }, [dispatch]);

  const dispatchError = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });

  const approveGroupSize = (
    invitation: HagenInvitation,
    approve: boolean
  ): void => {
    const approved = approve ? "approved" : "denied";
    const mail: Mail = {
      to: groupTo(invitation.invitees),
      subject: `Your group has been ${approved}`,
      text: `You requested an irregular group size for ${invitation.projectTitle} and it has been ${approved}.`,
    };
    fetch(`${UserGroup.url}/${invitation.groupId}/admin/irregular-size`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve, mail }),
    })
      .then((response) => response.json())
      .then(({ error }) => {
        if (error) throw error;
        // TODO update client data
      })
      .catch(dispatchError);
  };

  const approveReservationCancelation = (
    reservation: HagenReservation,
    approve: boolean
  ): void => {
    const approved = approve ? "approved" : "denied";
    const mail: Mail = {
      to: groupTo(reservation.members),
      subject: `Your booking cancelation exception has been ${approved}`,
      text: [
        `Your booking cancelation exception has been ${approved} for`,
        `${reservation.event.location} on ${reservation.event.start}.`,
        `Your hours for ${reservation.projectTitle} have`,
        approved ? "" : "NOT",
        "been refunded.",
      ].join(" "),
    };
    fetch(`${Reservation.url}/${reservation.id}/admin/cancel`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approve,
        mail,
      }),
    })
      .then((response) => response.json())
      .then(({ error }) => {
        if (error) throw error;
      })
      .catch(dispatchError);
  };

  return (
    <Dialog fullScreen={true} open={state.exceptionsDashboardIsOpen}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: AdminAction.CloseExceptionsDashboard })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5">Exceptions Dashboard</Typography>
      </Toolbar>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Group size exception requests</Typography>
        </AccordionSummary>
        {invitationsAreLoading ? (
          <CircularProgress />
        ) : invitations && invitations.length > 0 ? (
          <List>
            {invitations.map((invitation, i) => (
              <ListItem
                key={`invitation${i}`}
                style={{ justifyContent: "space-between" }}
              >
                <Paper
                  style={{
                    display: "flex",
                    flexGrow: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <section
                    style={{
                      textAlign: "center",
                      flexDirection: "column",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <b>Group Members</b>
                    <ListItem
                      key={`invitation-${i}-invitor-${invitation.invitorId}`}
                    >
                      TODO: lookup this user by this ID: {invitation.invitorId}
                    </ListItem>
                    {invitation.invitees.map((invitee) => (
                      <ListItem key={`invitation-${i}-invitee-${invitee.id}`}>
                        {invitee.name.first + " " + invitee.name.last}
                      </ListItem>
                    ))}
                  </section>
                  <section
                    style={{
                      textAlign: "center",
                      flexDirection: "column",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <b>Details</b>
                    <ListItem key={`invitation-${i}-projectTitle}`}>
                      {"Project: " + invitation.projectTitle}
                    </ListItem>
                    <ListItem key={`invitation-${i}-defaultGroupSize}`}>
                      {"Default Group Size: " + invitation.projectGroupSize}
                    </ListItem>
                    <ListItem key={`invitation-${i}-requestedGroupSize}`}>
                      {"Requested Group Size: " +
                        (Number(invitation.invitees.length) + 1)}
                    </ListItem>
                  </section>
                  <section
                    style={{
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-around",
                    }}
                  >
                    <ButtonGroup orientation="vertical" color="primary">
                      <Button
                        style={{ backgroundColor: "Green", color: "white" }}
                        onClick={(): void => approveGroupSize(invitation, true)}
                      >
                        Approve Exception
                      </Button>
                      <Button
                        style={{ backgroundColor: "Red", color: "white" }}
                        onClick={(): void =>
                          approveGroupSize(invitation, false)
                        }
                      >
                        Deny Exception
                      </Button>
                    </ButtonGroup>
                  </section>
                </Paper>
              </ListItem>
            ))}
          </List>
        ) : (
          "no pending group size exception requests"
        )}
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Reservation Cancelation Exceptions
          </Typography>
        </AccordionSummary>
        {reservationsAreLoading ? (
          <CircularProgress />
        ) : reservations && reservations.length > 0 ? (
          <List>
            {reservations.map((reservation) => (
              <ListItem
                key={`reservation${reservation.id}`}
                style={{ justifyContent: "space-between" }}
              >
                <Paper
                  style={{
                    display: "flex",
                    flexGrow: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <section
                    style={{
                      textAlign: "center",
                      flexDirection: "column",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <b>Group Members</b>
                    {reservation.members.map((member) => (
                      <ListItem
                        key={`reservation-${reservation.id}-invitee-${member.id}`}
                      >
                        {member.name.first + " " + member.name.last}
                      </ListItem>
                    ))}
                  </section>
                  <section
                    style={{
                      textAlign: "center",
                      flexDirection: "column",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <ListItem
                      key={`reservation-${reservation.id}-projectTitle}`}
                    >
                      {"Project: " + reservation.projectTitle}
                    </ListItem>
                    <ListItem key={`reservation-${reservation.id}-location}`}>
                      {"Location: " + reservation.event.location}
                    </ListItem>
                    <ListItem
                      key={`reservation-${reservation.id}-reservationStart}`}
                    >
                      {"Reservation Start: " +
                        formatDatetimeSeconds(
                          parseSQLDatetime(reservation.event.start)
                        )}
                    </ListItem>
                    <ListItem
                      key={`reservation-${reservation.id}-reservationEnd}`}
                    >
                      {"Reservation End: " +
                        parseSQLDatetime(reservation.event.end)}
                    </ListItem>

                    <ListItem
                      key={`reservation-${reservation.id}-cancelationRequested}`}
                    >
                      {"Refund Requested: " +
                        formatDatetimeSeconds(
                          parseSQLDatetime(
                            reservation.cancellation?.canceled.on || ""
                          )
                        )}
                    </ListItem>
                    <ListItem
                      key={`reservation-${reservation.id}-cancelationMessage}`}
                    >
                      {reservation.cancellation?.canceled.comment
                        ? "Message: " +
                          reservation.cancellation?.canceled.comment
                        : "User did not provide a message"}
                    </ListItem>
                  </section>
                  <section
                    style={{
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-around",
                    }}
                  >
                    <ButtonGroup orientation="vertical" color="primary">
                      <Button
                        style={{ backgroundColor: "Green", color: "white" }}
                        onClick={(): void =>
                          approveReservationCancelation(reservation, true)
                        }
                      >
                        Approve Exception
                      </Button>
                      <Button
                        style={{ backgroundColor: "Red", color: "white" }}
                        onClick={(): void =>
                          approveReservationCancelation(reservation, false)
                        }
                      >
                        Deny Exception
                      </Button>
                    </ButtonGroup>
                  </section>
                </Paper>
              </ListItem>
            ))}
          </List>
        ) : (
          "no pending cancelation exceptions"
        )}
      </Accordion>
    </Dialog>
  );
};

export default ExceptionsDashboard;
