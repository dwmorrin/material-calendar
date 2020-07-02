import React, { FunctionComponent, Fragment } from "react";
import {
  Dialog,
  IconButton,
  Toolbar,
  Typography,
  Button,
  FormLabel,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { CalendarAction } from "../calendar/types";
import Event from "../resources/Event";
import { Field, Formik, Form, FormikValues } from "formik";
import { TextField, CheckboxWithLabel } from "formik-material-ui";
import { DatePicker, DateTimePicker } from "formik-material-ui-pickers";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { useStyles } from "../calendar/reservationForm";

interface EventEditorProps {
  dispatch: (action: { type: CalendarAction; payload?: {} }) => void;
  open: boolean;
  event?: Event;
}

const EventEditor: FunctionComponent<EventEditorProps> = ({
  dispatch,
  open,
  event = new Event(),
}) => {
  const classes = useStyles();
  const initialValues = {
    ...event,
    __options__: {
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
    },
  };

  const onSubmit = (values: Event, actions: FormikValues): void => {
    const updating = values.id > 0;
    fetch(`${Event.url}${updating ? `/${values.id}` : ""}`, {
      method: updating ? "PUT" : "POST",
      body: JSON.stringify(values),
    })
      .then((response) => response.json())
      .then(({ data }) => console.log(data))
      .catch(console.error)
      .finally(() => {
        actions.setSubmitting(false);
      });
  };

  return (
    <Dialog open={open}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseEventEditor })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Edit {event.location.title} event</Typography>
      </Toolbar>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          {({ values }): unknown => (
            <Form className={classes.list}>
              <Field
                className={classes.item}
                component={TextField}
                label="Title"
                name="title"
              />
              <Field
                className={classes.item}
                component={DateTimePicker}
                label="Start"
                name="start"
              />
              <Field
                className={classes.item}
                component={DateTimePicker}
                label="End"
                name="end"
              />
              <Field
                component={CheckboxWithLabel}
                Label={{ label: "Reservable" }}
                type="checkbox"
                name="reservable"
              />
              <Field
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{ label: "Repeats" }}
                name="__options__.repeats"
              />
              {values.__options__.repeats && (
                <Fragment>
                  <FormLabel>Repeats on these days:</FormLabel>
                  <Field
                    component={CheckboxWithLabel}
                    type="checkbox"
                    Label={{ label: "Monday" }}
                    name="__options__.on.monday"
                  />
                  <Field
                    component={CheckboxWithLabel}
                    type="checkbox"
                    Label={{ label: "Tuesday" }}
                    name="__options__.on.tuesday"
                  />
                  <Field
                    component={CheckboxWithLabel}
                    type="checkbox"
                    Label={{ label: "Wednesday" }}
                    name="__options__.on.wednesday"
                  />
                  <Field
                    component={CheckboxWithLabel}
                    type="checkbox"
                    Label={{ label: "Thursday" }}
                    name="__options__.on.thursday"
                  />
                  <Field
                    component={CheckboxWithLabel}
                    type="checkbox"
                    Label={{ label: "Friday" }}
                    name="__options__.on.friday"
                  />
                  <Field
                    component={CheckboxWithLabel}
                    type="checkbox"
                    Label={{ label: "Saturday" }}
                    name="__options__.on.saturday"
                  />
                  <Field
                    component={CheckboxWithLabel}
                    type="checkbox"
                    Label={{ label: "Sunday" }}
                    name="__options__.on.sunday"
                  />
                  <Field
                    component={DatePicker}
                    label="Until"
                    name="__options__.until"
                  />
                </Fragment>
              )}
              <Button type="submit">
                {event.id < 1 ? "Create event" : "Edit event"}
              </Button>
            </Form>
          )}
        </Formik>
      </MuiPickersUtilsProvider>
    </Dialog>
  );
};

export default EventEditor;
