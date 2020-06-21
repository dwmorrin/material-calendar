import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../components/Transition";
import { object, string } from "yup";
import { FormikValues } from "formik";
import { CalendarState } from "./types";
import Project from "../resources/Project";
import { ResourceKey } from "../resources/types";

export const useStyles = makeStyles(() => ({
  list: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
}));

export const transition = makeTransition("left");

export const validationSchema = object().shape({
  phone: string().required("Please Enter a Phone Number"),
  description: string().required("Please Enter a description"),
  guests: string().when("hasGuests", {
    is: "yes",
    then: string().required("Please enter the names of your guests"),
  }),
});

export const submitHandler = (
  values: { [k: string]: unknown },
  actions: FormikValues
): void => {
  actions.setSubmitting(true);
  console.log({ ReservationForm: values });
  actions.setSubmitting(false);
};

export const makeInitialValues = (
  state: CalendarState
): { [k: string]: unknown } => {
  const project = (state.resources[ResourceKey.Projects] as Project[])[0];
  return {
    phone: "",
    description: "",
    guests: "",
    project: project.id,
    liveRoom: "no",
    hasGuests: "no",
    hasNotes: "no",
    hasEquipment: "no",
    equipment: {},
  };
};
