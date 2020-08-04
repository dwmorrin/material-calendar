import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../components/Transition";
import { object, string } from "yup";
import { FormikValues } from "formik";
import { CalendarState } from "./types";
import Project from "../resources/Project";
import UserGroup from "../resources/UserGroup";
import Equipment from "../resources/Equipment";
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

export function getCurrentEquipment(): Equipment[] | null {
  const values: Equipment[] = [];
  fetch(`/api/equipment`)
    .then((response) => response.json())
    .then((data) => {
      data.data.map((item: Equipment) => values.push(new Equipment(item)));
    });
  return values;
}

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
  // To work properly, this needs to be modified to exclude any equipment
  // that is unavailable at that requested reservation time. This should also
  // be done in the UI
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
        let quantityToReserve = requests[key].quantity;
        while (quantityToReserve > 0) {
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
          if (item.quantity >= quantityToReserve) {
            newList[item.id] = quantityToReserve;
            quantityToReserve = 0;
          } else {
            newList[item.id] = item.quantity;
            quantityToReserve = quantityToReserve - item.quantity;
          }
        }
      });
    });
  return newList;
}

export const updater = (values: {
  [k: string]: unknown;
}): {
  [k: string]: unknown;
} => {
  const newVal = {
    allotment_id: values.event,
    group_id: values.groupId,
    project_id: values.project,
    purpose: values.description,
    guests: values.hasGuests ? values.guests : null,
    living_room: values.liveRoom === "yes" ? 1 : 0,
    contact_phone: values.phone,
    notes: values.hasNotes === "yes" && values.notes ? values.notes : null,
    //gear: values.equipment,
  };
  if (values.id) {
    return { ...newVal, id: values.id };
  } else {
    return newVal;
  }
};

export const makeEquipmentRequests = (
  equipment: {
    [k: string]: any;
  },
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

export const submitHandler = (
  values: { [k: string]: unknown },
  actions: FormikValues
): void => {
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
  console.log(JSON.stringify(updater(values)));
  fetch(`/api/reservations${values.id ? `/${values.id}` : ""}`, {
    method: values.id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updater(values)),
  })
    .then((response) => response.json())
    .then(({ error, data, context }) => {
      console.log({ error, data, context });
      console.log(data);
      fetch(`/api/reservations/equipment/${data.id || values.id}`, {
        method: values.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          makeEquipmentRequests(values.equipment as {}, values.id || data.id)
        ),
      })
        .then((response) => response.json())
        .then(({ error, data, context }) => {
          console.log({ error, data, context });
        });
    })
    .catch(console.error)
    .finally(() => {
      actions.setSubmitting(false);
    });
};

export const makeInitialValues = (
  state: CalendarState
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
