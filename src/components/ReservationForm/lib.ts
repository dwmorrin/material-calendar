import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../Transition";
import { object, string } from "yup";
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

export const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  item: {
    marginTop: 30,
  },
  addEquipment: {
    backgroundColor: "yellow",
    color: "black",
  },
});

export const transition = makeTransition("left");

export const validationSchema = object().shape({
  phone: string().required("Please Enter a Phone Number"),
  description: string().required("Please Enter a description"),
  guests: string().when("hasGuests", {
    is: "yes",
    then: string().required("Please enter the names of your guests"),
  }),
});

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
  }: ReservationSubmitProps) =>
  (values: ReservationFormValues, actions: FormikValues): void => {
    actions.setSubmitting(true);
    const group = groups.find((group) => group.id === values.groupId);
    const project = projects.find((project) => project.id === values.projectId);
    if (!group || !project) {
      actions.setSubmitting(false);
      return dispatch({
        type: CalendarAction.Error,
        payload: {
          error: new Error("Invalid project/group in reservation form."),
        },
      });
    }

    // sends mail to anyone in this group
    const subject = `${User.formatName(user.name)} has ${
      values.id ? "modified" : "created"
    } a reservation for your group`;
    const when = formatDatetime(parseSQLDatetime(event.start));
    const mail: Mail = {
      to: groupTo(group.members),
      subject,
      text: `${subject} for ${project.title} on ${when} in ${event.location.title}`,
    };

    fetch(`${Reservation.url}${values.id ? `/${values.id}` : ""}`, {
      method: values.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updater(values), mail }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        if (!data) throw new Error("No data returned");
        const { event, reservation, group, project } = data;
        if (!event) throw new Error("No updated event returned");
        if (!reservation) throw new Error("No updated reservation returned");
        if (!group) throw new Error("No updated group returned");
        if (!project) throw new Error("No updated project returned");
        const message = values.id
          ? "Your Reservation has been updated!"
          : "Your Reservation has been made!";
        broadcast(SocketMessageKind.ReservationChanged, {
          eventId: event.id,
          reservationId: reservation.id,
          groupId: group.id,
          projectId: project.id,
        });
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
        closeForm();
      })
      .catch((error) =>
        dispatch({ type: CalendarAction.Error, payload: { error } })
      )
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
