import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../Transition";
import { object, string } from "yup";
import { FormikValues } from "formik";
import { CalendarAction } from "../../calendar/types";
import Project from "../../resources/Project";
import UserGroup from "../../resources/UserGroup";
import Reservation from "../../resources/Reservation";
import Equipment from "../../resources/Equipment";
import Event from "../../resources/Event";
import { Mail, groupTo } from "../../utils/mail";
import User from "../../resources/User";
import { ReservationFormValues, ReservationSubmitProps } from "./types";
import { EquipmentTable } from "./EquipmentForm/types";

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

// TODO: please include EQUIPMENT in this form
const updater = (values: Record<string, unknown>): Record<string, unknown> => {
  const updated = {
    allotmentId: values.event,
    groupId: values.groupId,
    projectId: values.project,
    description: values.description,
    guests: values.hasGuests ? values.guests : "",
    liveRoom: values.liveRoom === "yes" ? 1 : 0,
    phone: values.phone,
    notes: values.hasNotes === "yes" && values.notes ? values.notes : "",
  };
  return values.id ? { ...updated, id: values.id } : updated;
};

const groupMail = (
  { name: { first, last } }: User,
  { title }: Project,
  { members }: UserGroup,
  { start, location }: Event,
  type: "modified" | "created"
): Mail => {
  const subject = `${first} ${last} has ${type} a reservation for your group`;
  return {
    to: groupTo(members),
    subject,
    text: `${subject} for ${title} on ${start} in ${location.title}`,
  };
};

export const submitHandler =
  ({
    closeForm,
    dispatch,
    user,
    event,
    groups,
    projects,
  }: ReservationSubmitProps) =>
  (values: ReservationFormValues, actions: FormikValues): void => {
    actions.setSubmitting(true);
    const dispatchError = (error: Error): void =>
      dispatch({ type: CalendarAction.Error, payload: { error } });

    const group = groups.find((group) => group.id === values.groupId);
    const project = projects.find((project) => project.id === values.project);
    const mail =
      group && project && event
        ? groupMail(
            user,
            project,
            group,
            event,
            values.id ? "modified" : "created"
          )
        : undefined;

    fetch(`${Reservation.url}${values.id ? `/${values.id}` : ""}`, {
      method: values.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updater(values), mail }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) return dispatchError(error);
        if (!data) return dispatchError(new Error("No data returned"));
        // TODO: Update the reservation.
        // TODO: Update the equipment.
        dispatch({
          type: CalendarAction.DisplayMessage,
          payload: {
            message: values.id
              ? "Your Reservation has been updated!"
              : "Your Reservation has been made!",
          },
        });
      })
      .catch(dispatchError)
      .finally(() => {
        actions.setSubmitting(false);
        closeForm();
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
    event: event.id,
    groupId: group.id,
    phone: "",
    description: "",
    guests: "",
    project: project.id,
    liveRoom: "yes",
    hasGuests: "no",
    hasNotes: "no",
    hasEquipment: "no",
    equipment: {},
    __equipment__: equipment,
  };
  if (reservation) {
    // override defaults
    return {
      id: reservation.id,
      groupId: reservation.groupId,
      project: reservation.projectId,
      description: reservation.description,
      phone: reservation.contact,
      liveRoom: reservation.liveRoom ? "yes" : "no",
      guests: reservation.guests,
      hasGuests: reservation.guests ? "yes" : "no",
      hasNotes: reservation.notes ? "yes" : "no",
      notes: reservation.notes,
      // TODO use reservation equipment
      //equipment: reservation.equipment || {},
      equipment: defaultValues.equipment,
      __equipment__: defaultValues.__equipment__,
      hasEquipment: reservation.equipment ? "yes" : "no",
    };
  }
  return defaultValues;
};
