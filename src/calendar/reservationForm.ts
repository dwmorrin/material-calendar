import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../components/Transition";
import { object, string } from "yup";
import { FormikValues } from "formik";
import { CalendarAction, CalendarState, Action } from "./types";
import Project from "../resources/Project";
import UserGroup from "../resources/UserGroup";
import Reservation from "../resources/Reservation";
import Event from "../resources/Event";
import { ResourceKey } from "../resources/types";
import { Mail } from "../utils/mail";
import User from "../resources/User";

interface ReservationFormValues extends Record<string, unknown> {
  event?: number;
  groupId?: number;
  project: number;
  description: string;
  phone: string;
  liveRoom: string;
  guests: string;
  hasGuests: string;
  hasNotes: string;
  equipment: {
    [k: string]: {
      quantity: number;
      items?: { id: number; quantity: number }[];
    };
  };
  hasEquipment: string;
}

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
    to: members.map(({ email }) => email).join(),
    subject,
    text: `${subject} for ${title} on ${start} in ${location.title}`,
  };
};

export const submitHandler =
  (
    closeForm: () => void,
    dispatch: (action: Action) => void,
    user: User,
    event: Event | undefined,
    groups: UserGroup[],
    projects: Project[]
  ) =>
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

export const makeInitialValues = (
  state: CalendarState,
  projects: Project[]
): ReservationFormValues => {
  const project = projects[0] || new Project();
  const group = (state.resources[ResourceKey.Groups] as UserGroup[]).find(
    ({ projectId }) => projectId === project.id
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
  event?: Event
): ReservationFormValues | null => {
  if (!event?.reservation) {
    return null;
  }
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
    equipment: event.reservation.equipment || {},
    hasEquipment: event.reservation.equipment ? "yes" : "no",
  };
};
