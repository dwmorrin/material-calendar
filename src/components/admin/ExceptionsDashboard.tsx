import React, {
  FunctionComponent,
  useEffect,
  useState,
  useContext,
} from "react";
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
import Invitation from "../../resources/Invitation";
import Reservation from "../../resources/Reservation";
import { formatDatetime, parseSQLDatetime } from "../../utils/date";
import { sendMail } from "../../utils/mail";
import { AuthContext } from "../AuthContext";

const ExceptionsDashboard: FunctionComponent<AdminUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useContext(AuthContext);
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

  useEffect(() => {
    fetch("/api/invitations/exceptions")
      .then((response) => response.json())
      .then(({ data }) => setInvitations(data))
      .catch(console.error);
    fetch("/api/reservations/exceptions")
      .then((response) => response.json())
      .then(({ data }) => setReservations(data))
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
        {invitations && invitations.length > 0 ? (
          <List>
            {invitations.map((invitation) => (
              <ListItem
                key={`invitation${invitation.id}`}
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
                      key={`invitation-${invitation.id}-invitor-${invitation.invitor.id}`}
                    >
                      {invitation.invitor.name.first +
                        " " +
                        invitation.invitor.name.last}
                    </ListItem>
                    {invitation.invitees.map((invitee) => (
                      <ListItem
                        key={`invitation-${invitation.id}-invitee-${invitee.id}`}
                      >
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
                    <ListItem key={`invitation-${invitation.id}-projectTitle}`}>
                      {"Project: " + invitation.projectTitle}
                    </ListItem>
                    <ListItem
                      key={`invitation-${invitation.id}-defaultGroupSize}`}
                    >
                      {"Default Group Size: " + invitation.projectGroupSize}
                    </ListItem>
                    <ListItem
                      key={`invitation-${invitation.id}-requestedGroupSize}`}
                    >
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
                          fetch(
                            `/api/invitations/exceptions/${invitation.id}`,
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
                              } else {
                                //Create group from invitation
                                fetch(
                                  `/api/groups/invitation/${invitation.id}`,
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
                                      //Join users into group

                                      const insertId = data.id;
                                      fetch(
                                        `/api/groups/${insertId}/invitation/${invitation.id}`,
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
                                              sendMail(
                                                u.email,
                                                "Your group exception has been approved",
                                                "Hello " +
                                                  u.name?.first +
                                                  ", your group exception request limit has been approved for " +
                                                  invitation.projectTitle,
                                                dispatchError
                                              );
                                            });
                                            sendMail(
                                              invitation.invitor.email,
                                              "Your group exception has been approved",
                                              "Hello " +
                                                invitation.invitor.name?.first +
                                                ", your group exception request limit has been approved for " +
                                                invitation.projectTitle,
                                              dispatchError
                                            );
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
                        Grant Exception
                      </Button>
                      <Button
                        style={{ backgroundColor: "Red", color: "white" }}
                        onClick={(): void => {
                          fetch(
                            `/api/invitations/exceptions/${invitation.id}`,
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
                              invitation.invitees.forEach((u) => {
                                if (!u.email)
                                  return dispatchError(
                                    new Error(
                                      `${u.name.first} ${u.name.last} has no email`
                                    )
                                  );
                                sendMail(
                                  u.email,
                                  "Your group exception has been denied",
                                  "Hello " +
                                    u.name?.first +
                                    ", your group exception request limit has been denied for " +
                                    invitation.projectTitle,
                                  dispatchError
                                );
                              });
                              sendMail(
                                invitation.invitor.email,
                                "Your group exception has been denied",
                                "Hello " +
                                  invitation.invitor.name?.first +
                                  ", your group exception request limit has been denied for " +
                                  invitation.projectTitle,
                                dispatchError
                              );
                              fetch("/api/invitations/exceptions")
                                .then((response) => response.json())
                                .then(({ data }) => setInvitations(data))
                                .catch(console.error);
                            });
                        }}
                      >
                        Reject Exception
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
        {reservations && reservations.length > 0 ? (
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
                        formatDatetime(
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
                        formatDatetime(
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
                                  "Your booking cancelation exception has been granted",
                                  "Hello " +
                                    u.name?.first +
                                    ", your booking cancelation exception has been granted for your session in " +
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
                        Grant Exception
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
                        Reject Exception
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