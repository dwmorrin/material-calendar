import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../components/Transition";
import { object, string } from "yup";
import { FormikValues } from "formik";
import { CalendarAction, CalendarState, Action } from "./types";
import Project from "../resources/Project";
import UserGroup from "../resources/UserGroup";
import Equipment from "../resources/Equipment";
import Event from "../resources/Event";
import { ResourceKey } from "../resources/types";
import { sendMail } from "../utils/mail";
import User from "../resources/User";

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

export function getEquipmentIds(
  requests: {
    [k: string]: {
      quantity: number;
      items?: { id: number; quantity: number }[];
    };
  },
  event: Event
): {
  [k: number]: number;
} {
  const equipmentList: Equipment[] = [];
  const newList: {
    [k: string]: number;
  } = {};
  fetch(`/api/equipment`)
    .then((response) => response.json())
    .then((data) => {
      data.data.map((item: Equipment) =>
        equipmentList.push(new Equipment(item))
      );
    })
    .then(() => {
      const filteredList = Equipment.availableItems(equipmentList, event);
      Object.keys(requests).forEach((key) => {
        // TODO Determine why this can't be used directly with a ternary of ||
        // when setting quantityToChange
        const items: { id: number; quantity: number }[] =
          requests[key].items || [];
        // Put the current reservations into the reservation form.
        items.forEach((item) => (newList[item.id] = item.quantity));
        // set the quantity to reserve to the quantity to change from
        // the current reservation. If it is positive, reserve more, if it is
        // negative, set item reservations to 0 until the
        // requests[key].quantity is equal to the sum of requests[key].items
        // quantities
        let quantityToChange =
          requests[key].quantity -
          items.map((item) => item.quantity).reduce((a, b) => a + b, 0);
        while (quantityToChange > 0) {
          const item = filteredList
            .filter((item) => !newList[item.id])
            .find(
              (item) =>
                (item.manufacturer && item.model
                  ? item.manufacturer + " " + item.model
                  : item.description) === key
            );
          if (!item) {
            // This is an error, no item found with given modelId
            return null;
          }
          if (item.quantity >= quantityToChange) {
            newList[item.id] = quantityToChange;
            quantityToChange = 0;
          } else {
            newList[item.id] = item.quantity;
            quantityToChange = quantityToChange - item.quantity;
          }
        }
        for (let i = 0; quantityToChange < 0; ++i) {
          const item = items[i];
          // if we need to remove more than this item's quantity
          if (Math.abs(quantityToChange) >= item.quantity) {
            // bring quantityToChange closer to 0 by adding the item's
            // quantity as it is removed
            quantityToChange = quantityToChange + item.quantity;
            // set this requested item's quantity to 0
            newList[item.id] = 0;
          }
          // if we can reduce this single item to satisfy quantityToChange
          else {
            //reduce the item by the quantityToChange
            newList[item.id] = item.quantity + quantityToChange;
            // set quantity to reserve to 0, we are done
            quantityToChange = 0;
          }
        }
      });
    });
  return newList;
}

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

export const makeEquipmentRequests = (
  equipment: Record<string, unknown>,
  bookingId: number
): { id: string; bookingId: number; quantity: number }[] => {
  return Object.entries(equipment).map(([key, value]) => {
    return {
      id: key,
      bookingId: bookingId,
      quantity: value as number,
    };
  });
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
  (values: { [k: string]: unknown }, actions: FormikValues): void => {
    values = {
      ...values,
      equipment: getEquipmentIds(
        values.equipment as {
          [k: string]: {
            quantity: number;
            items?: { id: number; quantity: number }[];
          };
        },
        values.event as Event
      ),
    };
    actions.setSubmitting(true);
    const dispatchError = (error: Error): void =>
      dispatch({ type: CalendarAction.Error, payload: { error } });
    fetch(`/api/reservations${values.id ? `/${values.id}` : ""}`, {
      method: values.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updater(values)),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) return dispatchError(error);
        if (
          Object.entries(values.equipment as Record<string, unknown>).length
        ) {
          fetch(`/api/reservations/equipment/${data.id || values.id}`, {
            method: values.id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              makeEquipmentRequests(
                values.equipment as Record<string, unknown>,
                values.id || data.id
              )
            ),
          })
            .then((response) => response.json())
            .then(({ error }) => {
              if (error) dispatchError(error);
            })
            .catch(dispatchError);
        }
      })
      .catch(dispatchError)
      .finally(() => {
        actions.setSubmitting(false);
        if (event) {
          const group = groups.find((group) => group.id === values.groupId);
          const project = projects.find(
            (project) => project.id === values.project
          );
          const subject =
            (values.id ? "modified" : "created") +
            " a reservation for your group";
          const body =
            subject +
            " for " +
            project?.title +
            " on " +
            event.start +
            " in " +
            event.location.title;
          if (group) {
            group.members
              .filter((member) => member.username !== user.username)
              .forEach((member) =>
                sendMail(
                  member.email,
                  user.name.first + " " + user.name.last + " has " + subject,
                  "Hello " +
                    member.name.first +
                    ", " +
                    user.name.first +
                    " " +
                    user.name.last +
                    " has " +
                    body,
                  dispatchError
                )
              );
          }
          sendMail(
            user.email,
            "You have " + subject,
            "Hello " + user.name.first + ",  You have " + body,
            dispatchError
          );
        }
        dispatch({
          type: CalendarAction.DisplayMessage,
          payload: {
            message: values.id
              ? "Your Reservation has been updated!"
              : "Your Reservation has been made!",
          },
        });
        closeForm();
      });
  };

export const makeInitialValues = (
  state: CalendarState,
  projects: Project[]
): {
  event: number | undefined;
  groupId: number | undefined;
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
} => {
  const project = projects[0] || new Project();
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
): {
  id: number;
  event: number;
  groupId: number;
  project: number;
  description: string;
  phone: string;
  liveRoom: string;
  guests: string;
  hasGuests: string;
  hasNotes: string;
  notes: string;
  equipment: {
    [k: string]: {
      quantity: number;
      items?: { id: number; quantity: number }[];
    };
  };
  hasEquipment: string;
} | null => {
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
