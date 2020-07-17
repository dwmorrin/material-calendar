import { makeStyles } from "@material-ui/core";
import { Action } from "../calendar/types";
import Event from "../resources/Event";
import { FormikValues } from "formik";

export const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  item: {
    marginTop: 30,
  },
});

export const initialEventOptions = {
  repeats: false,
  on: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  },
};

export const onSubmit = (values: Event, actions: FormikValues): void => {
  const updating = values.id > 0;
  fetch(`${Event.url}${updating ? `/${values.id}` : ""}`, {
    method: updating ? "PUT" : "POST",
    body: JSON.stringify(values),
  })
    .then((response) => response.json())
    .then(({ error, data }) => {
      if (error) return console.error(error);
      console.log(data);
    })
    .catch(console.error)
    .finally(() => {
      actions.setSubmitting(false);
    });
};

export interface EventEditorProps {
  dispatch: (action: Action) => void;
  open: boolean;
  event?: Event;
}
