import { makeStyles } from "@material-ui/core";
import { makeTransition } from "../components/Transition";
import Event from "../resources/Event";

export const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  hoursBar: {
    margin: theme.spacing(1),
    height: 10,
  },
  toolbar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));

export const transition = makeTransition("right");

export const compareStartDates = (
  { start: a }: Event,
  { start: b }: Event
): number => new Date(a).getTime() - new Date(b).getTime();
