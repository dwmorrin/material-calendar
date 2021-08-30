import React, { FC } from "react";
import {
  Button,
  Dialog,
  FormLabel,
  IconButton,
  List,
  ListItem,
  Toolbar,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { CalendarAction } from "../../calendar/types";
import Event from "../../resources/Event";
import { Field, Formik, Form } from "formik";
import { TextField, CheckboxWithLabel } from "formik-material-ui";
import { DatePicker, DateTimePicker } from "formik-material-ui-pickers";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { initialEventOptions, makeOnSubmit, EventEditorProps } from "./lib";
import DateFnsUtils from "@date-io/date-fns";
import { parseSQLDatetime } from "../../utils/date";
import * as Yup from "yup";

//! TODO this correctly disables submit with invalid dates, but shows no info to user
const schema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  start: Yup.date(),
  end: Yup.date().min(Yup.ref("start"), "End date must be after start date"),
});

const EventEditor: FC<EventEditorProps> = ({
  dispatch,
  open,
  event = new Event(),
}) => {
  const initialValues = {
    ...event,
    start: parseSQLDatetime(event.start),
    end: parseSQLDatetime(event.end),
    __options__: initialEventOptions,
  };
  const onSubmit = makeOnSubmit(dispatch);

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
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={schema}
        >
          {({ values }): unknown => (
            <Form>
              <List>
                <ListItem>
                  <Field component={TextField} label="Title" name="title" />
                </ListItem>
                <ListItem>
                  <Field
                    component={DateTimePicker}
                    label="Start"
                    name="start"
                  />
                </ListItem>
                <ListItem>
                  <Field component={DateTimePicker} label="End" name="end" />
                </ListItem>
                <ListItem>
                  <Field
                    component={CheckboxWithLabel}
                    Label={{ label: "Reservable" }}
                    type="checkbox"
                    name="reservable"
                  />
                </ListItem>
                <ListItem>
                  {event.id < 1 && (
                    <Field
                      component={CheckboxWithLabel}
                      type="checkbox"
                      Label={{ label: "Repeats" }}
                      name="__options__.repeats"
                    />
                  )}
                </ListItem>
                {values.__options__.repeats && (
                  <ListItem>
                    <List>
                      <FormLabel>Repeats on these days:</FormLabel>
                      <ListItem>
                        <Field
                          component={CheckboxWithLabel}
                          type="checkbox"
                          Label={{ label: "Monday" }}
                          name="__options__.on.monday"
                        />
                      </ListItem>
                      <ListItem>
                        <Field
                          component={CheckboxWithLabel}
                          type="checkbox"
                          Label={{ label: "Tuesday" }}
                          name="__options__.on.tuesday"
                        />
                      </ListItem>
                      <ListItem>
                        <Field
                          component={CheckboxWithLabel}
                          type="checkbox"
                          Label={{ label: "Wednesday" }}
                          name="__options__.on.wednesday"
                        />
                      </ListItem>
                      <ListItem>
                        <Field
                          component={CheckboxWithLabel}
                          type="checkbox"
                          Label={{ label: "Thursday" }}
                          name="__options__.on.thursday"
                        />
                      </ListItem>
                      <ListItem>
                        <Field
                          component={CheckboxWithLabel}
                          type="checkbox"
                          Label={{ label: "Friday" }}
                          name="__options__.on.friday"
                        />
                      </ListItem>
                      <ListItem>
                        <Field
                          component={CheckboxWithLabel}
                          type="checkbox"
                          Label={{ label: "Saturday" }}
                          name="__options__.on.saturday"
                        />
                      </ListItem>
                      <ListItem>
                        <Field
                          component={CheckboxWithLabel}
                          type="checkbox"
                          Label={{ label: "Sunday" }}
                          name="__options__.on.sunday"
                        />
                      </ListItem>
                      <ListItem>
                        <Field
                          component={DatePicker}
                          label="Through (inclusive)"
                          name="__options__.until"
                        />
                      </ListItem>
                    </List>
                  </ListItem>
                )}
                <ListItem>
                  <Button variant="contained" color="primary" type="submit">
                    {event.id < 1 ? "Create event" : "Edit event"}
                  </Button>
                </ListItem>
                {process.env.NODE_ENV === "development" && (
                  <pre>{JSON.stringify(values, null, 2)}</pre>
                )}
              </List>
            </Form>
          )}
        </Formik>
      </MuiPickersUtilsProvider>
    </Dialog>
  );
};

export default EventEditor;
