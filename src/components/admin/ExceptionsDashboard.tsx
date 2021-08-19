import React, { FunctionComponent } from "react";
import {
  Accordion,
  AccordionSummary,
  Button,
  ButtonGroup,
  Dialog,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { AdminAction, AdminUIProps } from "../../admin/types";
import Event from "../../resources/Event";
import Project from "../../resources/Project";
import Reservation from "../../resources/Reservation";
import UserGroup from "../../resources/UserGroup";
import { formatDatetimeSeconds, parseSQLDatetime } from "../../utils/date";
import { Mail, groupTo } from "../../utils/mail";
import { ResourceKey } from "../../resources/types";

const ExceptionsDashboard: FunctionComponent<
  AdminUIProps & {
    exceptions: { groupSize: UserGroup[]; refunds: Reservation[] };
  }
> = ({ dispatch, state, exceptions: { groupSize, refunds } }) => {
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const events = state.resources[ResourceKey.Events] as Event[];
  const projects = state.resources[ResourceKey.Projects] as Project[];

  const dispatchError = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });

  const approveGroupSize = (invitation: UserGroup, approve: boolean): void => {
    const approved = approve ? "approved" : "denied";
    const mail: Mail = {
      to: groupTo(invitation.members),
      subject: `Your group has been ${approved}`,
      text: `You requested an irregular group size for ${invitation.projectTitle} and it has been ${approved}.`,
    };
    fetch(UserGroup.exceptionUrl.size(invitation), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve, mail }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        const groups: UserGroup[] = data.groups;
        if (!Array.isArray(groups))
          throw new Error("no updated groups sent back");
        dispatch({
          type: AdminAction.ReceivedResource,
          payload: {
            resources: {
              ...state.resources,
              [ResourceKey.Groups]: groups.map((g) => new UserGroup(g)),
            },
          },
          meta: ResourceKey.Groups,
        });
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
    fetch(Reservation.exceptionUrl.refund(reservation), {
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
            {groupSize.map((group, i) => {
              const project = projects.find(({ id }) => id === group.projectId);
              if (!project)
                return <ListItem>Error: project not found.</ListItem>;
              return (
                <List key={`invitation${i}`}>
                  <List>
                    <ListItem>Members</ListItem>
                    {group.members.map((invitee) => (
                      <ListItem key={`invitation-${i}-invitee-${invitee.id}`}>
                        <Button
                          onClick={(): void =>
                            window.alert("TODO: this will provide user info")
                          }
                        >
                          {invitee.name.first + " " + invitee.name.last}
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                  <Divider variant="middle" />
                  <ListItem>
                    <ListItemText>{project.title}</ListItemText>
                  </ListItem>
                  <ListItem>
                    <Grid container>
                      <Grid item xs={10} sm={3}>
                        <ListItemText>Project group size</ListItemText>
                      </Grid>
                      <Grid item xs={2}>
                        <ListItemText>{project.groupSize}</ListItemText>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <ListItem>
                    <Grid container>
                      <Grid item xs={10} sm={3}>
                        <ListItemText>Requested group size</ListItemText>
                      </Grid>
                      <Grid item xs={2}>
                        <ListItemText>{group.members.length}</ListItemText>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <ListItem>
                    <ButtonGroup>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={(): void => approveGroupSize(group, true)}
                      >
                        Approve Exception
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={(): void => approveGroupSize(group, false)}
                      >
                        Deny Exception
                      </Button>
                    </ButtonGroup>
                  </ListItem>
                </List>
              );
            })}
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
