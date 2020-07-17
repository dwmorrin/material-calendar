import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../components/Transition";
import { object, string } from "yup";
import { FormikValues } from "formik";
import { CalendarState } from "./types";
import Project from "../resources/Project";
import UserGroup from "../resources/UserGroup";
import Event from "../resources/Event";
import { ResourceKey } from "../resources/types";

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

export const updater = (values: {
  [k: string]: unknown;
}): {
  [k: string]: unknown;
} => {
  return {
    allotment_id: values.event,
    group_id: values.groupId,
    project_id: values.project,
    purpose: values.description,
    guests: values.hasGuests ? values.guests : null,
    living_room: values.liveRoom === "yes" ? 1 : 0,
    contact_phone: values.phone,
    notes: values.hasNotes ? values.notes : null,
  };
};

export const submitHandler = (
  values: { [k: string]: unknown },
  actions: FormikValues
): void => {
  actions.setSubmitting(true);
  console.log(JSON.stringify(updater(values)));
  fetch(`/api/reservations${values.id ? `/${values.id}` : ""}`, {
    method: values.id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updater(values)),
  })
    .then((response) => response.json())
    .then(({ error, data, context }) => console.log({ error, data, context }))
    .catch(console.error)
    .finally(() => {
      actions.setSubmitting(false);
    });
};

export const makeInitialValues = (
  state: CalendarState
): { [k: string]: unknown } => {
  const project =
    (state.resources[ResourceKey.Projects] as Project[])[0] || new Project();
  const group = (state.resources[ResourceKey.Groups] as UserGroup[]).find(
    (group) => group.projectId === project.id
  );
  return {
    event: state.currentEvent?.id,
    groupId: group?.id,
    phone: "",
    description: "",
    guests: "",
    project: project.id,
    liveRoom: "yes",
    hasGuests: "no",
    hasNotes: "no",
    hasEquipment: "no",
    equipment: {},
  };
};

export const getValuesFromReservation = (
  event: Event | undefined
): { [k: string]: unknown } | null => {
  if (!event?.reservation) {
    return null;
  }
  //notes not yet implemented
  return {
    id: event.reservation.id,
    event: event.id,
    groupId: event.reservation.groupId,
    project: event.reservation.projectId,
    description: event.reservation.description,
    phone: event.reservation.contact,
    liveRoom: event.reservation.liveRoom ? "yes" : "no",
    guests: event.reservation.guests,
    hasGuests: event.reservation.guests ? "yes" : "no",
    hasNotes: event.reservation.notes ? "yes" : "no",
    notes: event.reservation.notes,
    equipment: event.reservation.equipment,
    hasEquipment: event.reservation.equipment ? "yes" : "no",
  };
};
