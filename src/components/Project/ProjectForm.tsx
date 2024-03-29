import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../types";
import {
  Button,
  Dialog,
  Checkbox,
  DialogContent,
  FormLabel,
  IconButton,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { TextField } from "formik-material-ui";
import CloseIcon from "@material-ui/icons/Close";
import Location from "../../resources/Location";
import { Field, Form, Formik } from "formik";
import { ResourceKey } from "../../resources/types";
import {
  validationSchema,
  makeInitialValues,
  getValuesFromProject,
  useStyles,
  submitHandler,
  transition,
} from "./ProjectForm.lib";
import { DatePicker } from "formik-material-ui-pickers";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnUtils from "@date-io/date-fns";

const ProjectForm: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const classes = useStyles();

  function locationIsChecked(
    values: Record<string, unknown>,
    title: string
  ): boolean {
    if ("locations" in values && typeof values["locations"] === "object")
      return Boolean((values["locations"] as Record<string, unknown>)[title]);
    return false;
  }

  return (
    <Dialog
      fullScreen
      open={state.projectFormIsOpen}
      TransitionComponent={transition}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseProjectForm })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Create a Project</Typography>
      </Toolbar>
      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <Formik
            initialValues={
              getValuesFromProject(state.currentProject) ||
              makeInitialValues(state)
            }
            onSubmit={submitHandler}
            validationSchema={validationSchema}
          >
            {({
              values,
              isSubmitting,
              setFieldValue,
              handleSubmit,
            }): unknown => (
              <Form className={classes.list} onSubmit={handleSubmit}>
                <FormLabel className={classes.item}>Project Title</FormLabel>
                <Field
                  component={TextField}
                  label="Project Title"
                  name="title"
                  fullWidth
                  variant="filled"
                />
                <FormLabel className={classes.item}>Description</FormLabel>
                <Field
                  component={TextField}
                  label="Brief Description of the project"
                  name="description"
                  fullWidth
                  variant="filled"
                />
                <FormLabel className={classes.item}>Instructions</FormLabel>
                <Field
                  component={TextField}
                  label="Instructions"
                  name="instructions"
                  fullWidth
                  multiline
                  rows={8}
                  variant="filled"
                />
                <FormLabel>Locations:</FormLabel>
                {locations.map((location) => {
                  return (
                    <div key={location.title}>
                      <Checkbox
                        checked={locationIsChecked(values, location.title)}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                          checked: boolean
                        ): void =>
                          setFieldValue(
                            "locations[" + location.title + "]",
                            checked
                          )
                        }
                        name={"locations[" + location.title + "]"}
                      />
                      {location.title}
                    </div>
                  );
                })}
                <FormLabel className={classes.item}>Group Size</FormLabel>
                <Field
                  component={TextField}
                  label="Group Size"
                  name="groupSize"
                  fullWidth
                  variant="filled"
                />
                <FormLabel className={classes.item}>Hours Per Group</FormLabel>
                <Field
                  component={TextField}
                  label="Hours Per Group"
                  name="groupAllottedHours"
                  variant="filled"
                />
                <FormLabel className={classes.item}>Start Date</FormLabel>
                <Field component={DatePicker} name="start" />
                <FormLabel className={classes.item}>End Date</FormLabel>
                <Field component={DatePicker} name="end" />
                <FormLabel className={classes.item}>
                  Reserving time allowed starting:
                </FormLabel>
                <Field component={DatePicker} name="reservationStart" />
                <Button
                  className={classes.item}
                  type="submit"
                  size="small"
                  variant="contained"
                  disableElevation
                  style={{ backgroundColor: "Green", color: "white" }}
                  disabled={isSubmitting}
                >
                  Create Project
                </Button>
                <pre>{JSON.stringify(values, null, 2)}</pre>
              </Form>
            )}
          </Formik>
        </MuiPickersUtilsProvider>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
