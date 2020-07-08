import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../components/Transition";
import { object, string } from "yup";
import { FormikValues } from "formik";
import { CalendarState } from "./types";
import Course from "../resources/Course";
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
  description: string().required("Please Enter a description"),
  instructions: string().required("Please enter instructions"),
  groupSize: string().required("Please enter a group size"),
  hoursPerGroup: string().required(
    "Please the number of hours available to each group"
  ),
  startDate: string().required("Please enter the start date for the Project"),
  endDate: string().required("Please enter the end date for the Project"),
  reservationStart: string().required(
    "Please enter date to open up booking for this project"
  ),
});

export const submitHandler = (
  values: { [k: string]: unknown },
  actions: FormikValues
): void => {
  actions.setSubmitting(true);
  actions.console.log({ ProjectForm: values });
  actions.setSubmitting(false);
};

export const makeInitialValues = (
  state: CalendarState
): { [k: string]: unknown } => {
  const course =
    (state.resources[ResourceKey.Courses] as Course[])[0] || new Course();
  return {
    course: course.id,
    description: "",
    instructions: "",
    groupSize: "",
    hoursPerGroup: "",
    startDate: "",
    endDate: "",
    reservationStart: "",
    locations: {},
  };
};
