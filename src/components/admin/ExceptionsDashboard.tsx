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
import Invitation from "../../resources/Invitation";
import Reservation from "../../resources/Reservation";
import { formatDatetimeSeconds, parseSQLDatetime } from "../../utils/date";
import { sendMail } from "../../utils/mail";
import { useAuth } from "../AuthProvider";

const ExceptionsDashboard: FunctionComponent<AdminUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState(
    [] as (Invitation & { projectTitle: string; projectGroupSize: number })[]
  );
  const [reservations, setReservations] = useState(
    [] as (Reservation & {
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
    })[]
  );

  const [invitationsAreLoading, setInvitationsAreLoading] = useState(false);
  const [reservationsAreLoading, setReservationsAreLoading] = useState(false);

  useEffect(() => {
    setInvitationsAreLoading(true);
    fetch("/api/invitations/exceptions")
      .then((response) => response.json())
      .then(({ data }) => {
        setInvitations(data);
        setInvitationsAreLoading(false);
      })
      .catch(console.error);
    setReservationsAreLoading(true);
    fetch("/api/reservations/exceptions")
      .then((response) => response.json())
      .then(({ data }) => {
        setReservations(data);
        setReservationsAreLoading(false);
      })
      .catch(console.error);
  }, []);

  const dispatchError = (error: Error, meta?: unknown): void =>
    dispatch({ type: AdminAction.Error, payload: { error }, meta });

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
                        onClick={(): void => {
                          fetch(`/api/invitations/exceptions/${i}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              approved: 1,
                              adminId: user.id,
                            }),
                          })
                            .then((response) => response.json())
                            .then(({ error, data }) => {
                              if (error || !data) {
                                return dispatch({
                                  type: AdminAction.Error,
                                  payload: { error },
                                });
                              } else {
                                //Create group from invitation
                                fetch(`/api/groups/invitation/${i}`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: "",
                                })
                                  .then((response) => response.json())
                                  .then(({ error, data }) => {
                                    if (error || !data) {
                                      return dispatch({
                                        type: AdminAction.Error,
                                        payload: { error },
                                      });
                                    } else {
                                      //Join users into group

                                      const insertId = data.id;
                                      fetch(
                                        `/api/groups/${insertId}/invitation/${i}`,
                                        {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: "",
                                        }
                                      )
                                        .then((response) => response.json())
                                        .then(({ error, data }) => {
                                          if (error || !data) {
                                            return dispatch({
                                              type: AdminAction.Error,
                                              payload: { error },
                                            });
                                          } else {
                                            invitation.invitees.forEach((u) => {
                                              if (!u.email)
                                                return dispatchError(
                                                  new Error(
                                                    `${u.name.first} ${u.name.last} has no email`
                                                  )
                                                );
                                              //   sendMail(
                                              //     u.email,
                                              //     "Your group exception has been approved",
                                              //     "Hello " +
                                              //       u.name?.first +
                                              //       ", your group exception request limit has been approved for " +
                                              //       invitation.projectTitle,
                                              //     dispatchError
                                              //   );
                                            });
                                            // sendMail(
                                            //   invitation.invitor.email,
                                            //   "Your group exception has been approved",
                                            //   "Hello " +
                                            //     invitation.invitor.name?.first +
                                            //     ", your group exception request limit has been approved for " +
                                            //     invitation.projectTitle,
                                            //   dispatchError
                                            // );
                                            fetch("/api/invitations/exceptions")
                                              .then((response) =>
                                                response.json()
                                              )
                                              .then(({ data }) =>
                                                setInvitations(data)
                                              )
                                              .catch(console.error);
                                          }
                                        });
                                    }
                                  });
                              }
                            });
                        }}
                      >
                        Approve Exception
                      </Button>
                      <Button
                        style={{ backgroundColor: "Red", color: "white" }}
                        onClick={(): void => {
                          fetch(`/api/invitations/exceptions/${i}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              denied: 1,
                              adminId: user.id,
                            }),
                          })
                            .then((response) => response.json())
                            .then(({ error, data }) => {
                              if (error || !data) {
                                return dispatch({
                                  type: AdminAction.Error,
                                  payload: { error },
                                });
                              }
                              invitation.invitees.forEach((u) => {
                                if (!u.email)
                                  return dispatchError(
                                    new Error(
                                      `${u.name.first} ${u.name.last} has no email`
                                    )
                                  );
                                // sendMail(
                                //   u.email,
                                //   "Your group exception has been denied",
                                //   "Hello " +
                                //     u.name?.first +
                                //     ", your group exception request limit has been denied for " +
                                //     invitation.projectTitle,
                                //   dispatchError
                                // );
                              });
                              // sendMail(
                              //   invitation.invitor.email,
                              //   "Your group exception has been denied",
                              //   "Hello " +
                              //     invitation.invitor.name?.first +
                              //     ", your group exception request limit has been denied for " +
                              //     invitation.projectTitle,
                              //   dispatchError
                              // );
                              fetch("/api/invitations/exceptions")
                                .then((response) => response.json())
                                .then(({ data }) => setInvitations(data))
                                .catch(console.error);
                            });
                        }}
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
                        onClick={(): void => {
                          fetch(
                            `/api/reservations/exceptions/${reservation.id}`,
                            {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                approved: 1,
                                adminId: user.id,
                              }),
                            }
                          )
                            .then((response) => response.json())
                            .then(({ error, data }) => {
                              if (error || !data) {
                                return dispatch({
                                  type: AdminAction.Error,
                                  payload: { error },
                                });
                              }
                              reservation.members.forEach((u) => {
                                if (!u.email)
                                  return dispatchError(
                                    new Error(
                                      `${u.name.first} ${u.name.last} has no email`
                                    )
                                  );
                                sendMail(
                                  u.email,
                                  "Your booking cancelation exception has been approved",
                                  "Hello " +
                                    u.name?.first +
                                    ", your booking cancelation exception has been approved for your session in " +
                                    reservation.event.location +
                                    " on " +
                                    reservation.event.start +
                                    ". Your hours for " +
                                    reservation.projectTitle +
                                    " have been refunded.",
                                  dispatchError
                                );
                              });
                              fetch("/api/reservations/exceptions")
                                .then((response) => response.json())
                                .then(({ data }) => setReservations(data))
                                .catch(console.error);
                            });
                        }}
                      >
                        Approve Exception
                      </Button>
                      <Button
                        style={{ backgroundColor: "Red", color: "white" }}
                        onClick={(): void => {
                          fetch(
                            `/api/reservations/exceptions/${reservation.id}`,
                            {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                denied: 1,
                                adminId: user.id,
                              }),
                            }
                          )
                            .then((response) => response.json())
                            .then(({ error, data }) => {
                              if (error || !data) {
                                return dispatch({
                                  type: AdminAction.Error,
                                  payload: { error },
                                });
                              }
                              reservation.members.forEach((u) => {
                                if (!u.email)
                                  return dispatchError(
                                    new Error(
                                      `${u.name.first} ${u.name.last} has no email`
                                    )
                                  );
                                sendMail(
                                  u.email,
                                  "Your booking cancelation exception has been denied",
                                  "Hello " +
                                    u.name?.first +
                                    ", your booking cancelation exception has been denied for your session in " +
                                    reservation.event.location +
                                    " on " +
                                    reservation.event.start +
                                    ". Your hours for " +
                                    reservation.projectTitle +
                                    " have NOT been refunded.",
                                  dispatchError
                                );
                              });
                              fetch("/api/reservations/exceptions")
                                .then((response) => response.json())
                                .then(({ data }) => setReservations(data))
                                .catch(console.error);
                            });
                        }}
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
