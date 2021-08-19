import React, { FunctionComponent } from "react";
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
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { AdminAction, AdminUIProps } from "../../admin/types";
import UserGroup from "../../resources/UserGroup";
import Reservation from "../../resources/Reservation";
import { formatDatetimeSeconds, parseSQLDatetime } from "../../utils/date";
import { Mail, groupTo } from "../../utils/mail";
import { ResourceKey } from "../../resources/types";
import Event from "../../resources/Event";

const ExceptionsDashboard: FunctionComponent<
  AdminUIProps & {
    exceptions: { groupSize: UserGroup[]; refunds: Reservation[] };
  }
> = ({ dispatch, state, exceptions: { groupSize, refunds } }) => {
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const events = state.resources[ResourceKey.Events] as Event[];

  const dispatchError = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });

  const approveGroupSize = (invitation: UserGroup, approve: boolean): void => {
    const approved = approve ? "approved" : "denied";
    const mail: Mail = {
      to: groupTo(invitation.members),
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
    reservation: Reservation,
    group: UserGroup,
    event: Event,
    approve: boolean
  ): void => {
    const approved = approve ? "approved" : "denied";
    const mail: Mail = {
      to: groupTo(group.members),
      subject: `Your booking cancelation exception has been ${approved}`,
      text: [
        `Your booking cancelation exception has been ${approved} for`,
        `${event.location} on ${event.start}.`,
        `Your hours for ${reservation.projectTitle} have`,
        approved ? "" : "NOT",
        "been refunded.",
      ].join(" "),
    };
    fetch(Reservation.exceptionUrl.size(reservation), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approved: approve,
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
          <Typography variant="h6">Group size</Typography>
        </AccordionSummary>
        {groupSize && !!groupSize.length ? (
          <List>
            {groupSize.map((invitation, i) => (
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
                    {invitation.members.map((invitee) => (
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
                      {"Requested Group Size: " + invitation.members.length}
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
        {refunds && !!refunds.length ? (
          <List>
            {refunds.map((reservation) => {
              const group = groups.find(({ id }) => id === reservation.groupId);
              if (!group)
                return <ListItem>Error: could not find group.</ListItem>;
              const event = events.find(({ id }) => id === reservation.eventId);
              if (!event)
                return <ListItem>Error: could not find event.</ListItem>;
              return (
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
                      {group.members.map((member) => (
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
                        {"Location: " + event.location}
                      </ListItem>
                      <ListItem
                        key={`reservation-${reservation.id}-reservationStart}`}
                      >
                        {"Reservation Start: " +
                          formatDatetimeSeconds(parseSQLDatetime(event.start))}
                      </ListItem>
                      <ListItem
                        key={`reservation-${reservation.id}-reservationEnd}`}
                      >
                        {"Reservation End: " + parseSQLDatetime(event.end)}
                      </ListItem>

                      <ListItem
                        key={`reservation-${reservation.id}-cancelationRequested}`}
                      >
                        {"Refund Requested: " +
                          formatDatetimeSeconds(
                            parseSQLDatetime(
                              reservation.cancelation?.canceled.on || ""
                            )
                          )}
                      </ListItem>
                      <ListItem
                        key={`reservation-${reservation.id}-cancelationMessage}`}
                      >
                        {reservation.cancelation?.canceled.comment
                          ? "Message: " +
                            reservation.cancelation?.canceled.comment
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
                            approveReservationCancelation(
                              reservation,
                              group,
                              event,
                              true
                            )
                          }
                        >
                          Approve Exception
                        </Button>
                        <Button
                          style={{ backgroundColor: "Red", color: "white" }}
                          onClick={(): void =>
                            approveReservationCancelation(
                              reservation,
                              group,
                              event,
                              false
                            )
                          }
                        >
                          Deny Exception
                        </Button>
                      </ButtonGroup>
                    </section>
                  </Paper>
                </ListItem>
              );
            })}
          </List>
        ) : (
          "no pending cancelation exceptions"
        )}
      </Accordion>
    </Dialog>
  );
};

export default ExceptionsDashboard;
