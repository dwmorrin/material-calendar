import React, { FC } from "react";
import { Button, ButtonGroup, List, ListItem, Paper } from "@material-ui/core";
import { AdminAction, AdminUIProps } from "../types";
import Event from "../../../resources/Event";
import Project from "../../../resources/Project";
import Reservation from "../../../resources/Reservation";
import UserGroup from "../../../resources/UserGroup";
import { formatDatetimeSeconds, parseSQLDatetime } from "../../../utils/date";
import { Mail, groupTo } from "../../../utils/mail";
import { ResourceKey } from "../../../resources/types";

const RefundList: FC<
  AdminUIProps & {
    reservations: Reservation[];
  }
> = ({ dispatch, reservations, state }) => {
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const events = state.resources[ResourceKey.Events] as Event[];
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
    const onError = (error: Error): void =>
      dispatch({ type: AdminAction.Error, payload: { error } });
    fetch(Reservation.exceptionUrl.refund(reservation), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approved: approve,
        mail,
      }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) return onError(error);
        if (!data) return onError(new Error("No data returned"));
        dispatch({
          type: AdminAction.ReceivedResource,
          meta: ResourceKey.Reservations,
          payload: {
            resources: {
              ...state.resources,
              [ResourceKey.Reservations]: [data],
            },
          },
        });
      })
      .catch(onError);
  };

  return (
    <List>
      {reservations.map((reservation) => {
        const group = groups.find(({ id }) => id === reservation.groupId);
        if (!group) return <ListItem>Error: could not find group.</ListItem>;
        const event = events.find(({ id }) => id === reservation.eventId);
        if (!event) return <ListItem>Error: could not find event.</ListItem>;
        const project = projects.find(({ id }) => id === reservation.projectId);
        if (!project)
          return <ListItem>Error: could not find project.</ListItem>;
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
                <ListItem key={`reservation-${reservation.id}-projectTitle}`}>
                  {"Project: " + project.title}
                </ListItem>
                <ListItem key={`reservation-${reservation.id}-location}`}>
                  {"Location: " + event.location.title}
                </ListItem>
                <ListItem
                  key={`reservation-${reservation.id}-reservationStart}`}
                >
                  {"Reservation Start: " +
                    formatDatetimeSeconds(parseSQLDatetime(event.start))}
                </ListItem>
                <ListItem key={`reservation-${reservation.id}-reservationEnd}`}>
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
                    ? "Message: " + reservation.cancelation?.canceled.comment
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
  );
};

export default RefundList;
