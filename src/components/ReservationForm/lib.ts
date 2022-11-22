import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../Transition";
import { FormikValues } from "formik";
import { CalendarAction } from "../types";
import Project from "../../resources/Project";
import UserGroup from "../../resources/UserGroup";
import Reservation from "../../resources/Reservation";
import Equipment, {
  EquipmentReservationValue,
  EquipmentTable,
} from "../../resources/Equipment";
import Event from "../../resources/Event";
import { Mail, groupTo } from "../../utils/mail";
import User from "../../resources/User";
import {
  ReservationSubmitValues,
  ReservationFormValues,
  ReservationSubmitProps,
} from "./types";
import { formatDatetime, parseSQLDatetime } from "../../utils/date";
import { ResourceKey } from "../../resources/types";
import { SocketMessageKind } from "../SocketProvider";
import forward from "./forward";

export const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  item: {
    marginTop: 30,
  },
});

export const transition = makeTransition("left");

const updater = (values: ReservationFormValues): ReservationSubmitValues => ({
  id: values.id,
  eventId: values.eventId,
  projectId: values.projectId,
  groupId: values.groupId,
  description: values.description,
  guests: values.hasGuests ? values.guests : "",
  liveRoom: values.liveRoom === "yes",
  phone: values.phone,
  notes: values.hasNotes === "yes" && values.notes ? values.notes : "",
  equipment: Object.entries(values.equipment as EquipmentTable).reduce(
    (acc, [, info]) => acc.concat(info.items.slice(0, info.quantity)),
    [] as EquipmentReservationValue[]
  ),
});

export const submitHandler =
  ({
    broadcast,
    closeForm,
    dispatch,
    user,
    event,
    groups,
    projects,
    isAdmin = false,
  }: ReservationSubmitProps) =>
  (values: ReservationFormValues, actions: FormikValues): void => {
    const onError = (error: Error): void =>
      dispatch({ type: CalendarAction.Error, payload: { error } });
    actions.setSubmitting(true);
    const project = projects.find((project) => project.id === values.projectId);
    const group = groups.find((group) => group.id === values.groupId);
    if (!group || !project) {
      actions.setSubmitting(false);
      return onError(new Error("Invalid project/group in reservation form."));
    }

    // sends mail to anyone in this group
    const subject = `${User.formatName(user.name)} has ${
      values.id ? "modified" : "created"
    } a reservation for your group`;
    const when = formatDatetime(parseSQLDatetime(event.start));
    const mail: Mail[] = [];
    if (values.sendEmail === "yes")
      mail.push({
        to: groupTo(group.members),
        subject,
        text: `${subject} for ${project.title} on ${when} in ${event.location.title}`,
      });
    if (project.title.startsWith(Project.classMeetingTitlePrefix)) {
      mail.push({
        to: String(process.env.REACT_APP_ADMIN_EMAIL),
        subject: "Update to class meeting",
        text: [
          `${group.title} has updated for ${when} in ${event.location.title}.`,
          `Requesting equipment? ${values.hasEquipment}.`,
          "Notes:",
          values.notes || "(no notes)",
        ].join("\n"),
      });
    } else if (values.hasNotes && Boolean(values.notes.trim())) {
      mail.push({
        to: String(process.env.REACT_APP_ADMIN_EMAIL),
        subject: `Booking notes: ${group.title}, ${when}, ${event.location.title}`,
        text: [
          `Group: ${group.title}`,
          `When: ${when}`,
          `Where: ${event.location.title}`,
          `Requesting equipment? ${values.hasEquipment}.`,
          "Notes:",
          values.notes,
        ].join("\n"),
      });
    }

    // apply form values to data
    const formToSubmit = updater(values);
    const method = values.id ? "PUT" : "POST";

    fetch(`${Reservation.url}${values.id ? `/${values.id}` : ""}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formToSubmit, mail, isAdmin }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        if (!data) throw new Error("No data returned");
        const { event, reservation, group, project, isAdmin } = data;
        if (!event) throw new Error("No updated event returned");
        if (!reservation) throw new Error("No updated reservation returned");
        if (!group) throw new Error("No updated group returned");
        if (!project) throw new Error("No updated project returned");

        const message = values.id
          ? "Your Reservation has been updated!"
          : "Your Reservation has been made!";

        forward({
          reservation: formToSubmit,
          reservationId: reservation.id,
          method,
          onError,
        });

        // send reservation info to currently connected users
        broadcast(SocketMessageKind.ReservationChanged, {
          eventId: event.id,
          reservationId: reservation.id,
          groupId: group.id,
          projectId: project.id,
        });

        // update local state
        if (isAdmin) {
          dispatch({
            type: CalendarAction.ReceivedAdminReservationUpdate,
            payload: {
              resources: {
                [ResourceKey.Events]: [new Event(event)],
                [ResourceKey.Reservations]: [new Reservation(reservation)],
                [ResourceKey.Groups]: [new UserGroup(group)],
                [ResourceKey.Projects]: [new Project(project)],
              },
              message: "Reservation made.",
            },
          });
        } else {
          dispatch({
            type: CalendarAction.ReceivedReservationUpdate,
            payload: {
              resources: {
                [ResourceKey.Events]: [new Event(event)],
                [ResourceKey.Reservations]: [new Reservation(reservation)],
                [ResourceKey.Groups]: [new UserGroup(group)],
                [ResourceKey.Projects]: [new Project(project)],
              },
              message,
            },
          });
        }
        closeForm();
      })
      .catch(onError)
      .finally(() => {
        actions.setSubmitting(false);
      });
  };

export const makeEquipmentValues = (equipment: Equipment[]): EquipmentTable =>
  equipment.reduce((acc, item) => {
    const hash = Equipment.makeNameHash(item);
    if (!(hash in acc))
      acc[hash] = {
        quantity: 0,
        maxQuantity: 0,
        restriction: item.restriction,
        category: { id: item.category.id },
        items: [{ id: item.id, quantity: item.quantity }],
      };
    else acc[hash].items.push({ id: item.id, quantity: item.quantity });
    acc[hash].maxQuantity += item.quantity;
    return acc;
  }, {} as EquipmentTable);

export const makeInitialValues = (
  event: Event,
  group: UserGroup,
  equipment: EquipmentTable,
  project: Project
): ReservationFormValues => {
  const reservation = event.reservation;
  const defaultValues = {
    id: 0,
    eventId: event.id,
    groupId: group.id,
    projectId: project.id,
    phone: "",
    description: "",
    guests: "",
    liveRoom: "yes",
    hasGuests: "no",
    hasNotes: "no",
    notes: "",
    hasEquipment: "no",
    equipment: {},
    __equipment__: equipment,
    sendEmail: "yes",
  };

  if (reservation) {
    return {
      ...defaultValues,
      id: reservation.id,
      groupId: reservation.groupId,
      projectId: reservation.projectId,
      description: reservation.description,
      phone: reservation.contact,
      liveRoom: reservation.liveRoom ? "yes" : "no",
      guests: reservation.guests,
      hasGuests: reservation.guests ? "yes" : "no",
      hasNotes: reservation.notes ? "yes" : "no",
      notes: reservation.notes,
      equipment: reservation.equipment || defaultValues.equipment,
      hasEquipment: reservation.equipment ? "yes" : "no",
    };
  }
  return defaultValues;
};
