import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../components/Transition";
import { object, string } from "yup";
import { FormikValues } from "formik";
import { CalendarState } from "./types";
import Course from "../resources/Course";
import Project from "../resources/Project";
import { ResourceKey } from "../resources/types";
import { formatYYYYMMDD } from "../utils/date";

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

export const transition = makeTransition("right");

export const validationSchema = object().shape({
  description: string().required("Please Enter a description"),
  instructions: string().required("Please enter instructions"),
  groupSize: string().required("Please enter a group size"),
  hoursPerGroup: string().required(
    "Please the number of hours available to each group"
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
  return {
    course: state.currentCourse?.id,
    title: "",
    description: "",
    instructions: "",
    groupSize: "",
    groupAllottedHours: "",
    start: new Date().toJSON().split("T")[0],
    end: new Date().toJSON().split("T")[0],
    reservationStart: new Date().toJSON().split("T")[0],
    locations: {},
  };
};

export const getValuesFromProject = (
  project: Project | undefined
): { [k: string]: unknown } | null => {
  if (!project) {
    return null;
  }
  console.log(new Date(project.start).toJSON().split("T")[0]);
  return {
    ...project,
    course: project.course.id,
  };
};
