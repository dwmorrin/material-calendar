import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../components/Transition";
import * as Yup from "yup";
import { FormikValues } from "formik";
import { CalendarState } from "./types";
import Project from "../resources/Project";
import { ResourceKey } from "../resources/types";
import UserGroup from "../resources/UserGroup";

export const useStyles = makeStyles(() => ({
  list: {
    display: "flex",
    justifyContent: "flex-start",
    alignContent: "row",
  },
  paddingLeftTen: {
    paddingLeft: 10,
  },
  paddingLeftSixteen: {
    paddingLeft: 16,
  },
  paddingLeftFive: {
    paddingLeft: 5,
  },
}));

export const transition = makeTransition("left");

export const validationSchema = Yup.object().shape({
  phone: Yup.string().required("Please Enter a Phone Number"),
  description: Yup.string().required("Please Enter a description"),
  guests: Yup.string().when("hasGuests", {
    is: "yes",
    then: Yup.string().required("Please enter the names of your guests"),
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
    event: state.currentEvent,
    currentCategory: "",
    searchString: "",
    phone: "",
    description: "",
    guests: "",
    project,
    liveRoom: "no",
    hasGuests: "no",
    hasNotes: "no",
    hasEquipment: "no",
    group: (state.resources[ResourceKey.Groups] as UserGroup[]).find(
      (g) => g.projectId === project.id
    ),
    equipment: {},
    filters: {},
  };
};
