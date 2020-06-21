import React, { FunctionComponent, useState, Fragment } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Radio,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { RadioGroup, Select, TextField } from "formik-material-ui";
import CloseIcon from "@material-ui/icons/Close";
import UserGroup from "../resources/UserGroup";
import { Field, Form, Formik } from "formik";
import EquipmentForm from "./EquipmentForm";
import QuantityList from "./QuantityList";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import {
  validationSchema,
  makeInitialValues,
  useStyles,
  submitHandler,
  transition,
} from "../calendar/reservationForm";

const RadioYesNo: FunctionComponent<{ label: string; name: string }> = ({
  label,
  name,
}) => (
  <Fragment>
    <FormLabel component="legend">{label}</FormLabel>
    <Field component={RadioGroup} name={name}>
      <FormControlLabel value="yes" control={<Radio />} label="Yes" />
      <FormControlLabel value="no" control={<Radio />} label="No" />
    </Field>
  </Fragment>
);

const ReservationForm: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const [equipmentFormIsOpen, setEquipmentFormIsOpen] = useState(false);
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const classes = useStyles();

  return (
    <Dialog
      fullScreen
      open={state.reservationFormIsOpen}
      TransitionComponent={transition}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseReservationForm })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Make Reservation</Typography>
      </Toolbar>

      <DialogContent>
        <Formik
          initialValues={makeInitialValues(state)}
          onSubmit={submitHandler}
          validationSchema={validationSchema}
        >
          {({ values, isSubmitting, setFieldValue, handleSubmit }): unknown => (
            <Form className={classes.list} onSubmit={handleSubmit}>
              <FormLabel>Project:</FormLabel>
              <Field component={Select} name="project">
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title}
                  </MenuItem>
                ))}
              </Field>
              <FormLabel>Group:</FormLabel>
              {(
                groups.find((group) => group.projectId === values.project) ||
                new UserGroup()
              ).members.map(({ username, name }) => (
                <span key={username}>
                  {`${name.first} ${name.last}`}
                  <br />
                </span>
              ))}
              <Field
                component={TextField}
                label="Brief Description of what you will be doing"
                name="description"
                fullWidth
                variant="filled"
              />
              <RadioYesNo
                label="Do you need to use the Live Room?"
                name="liveRoom"
              />
              <Field
                component={TextField}
                label="Phone Number"
                name="phone"
                fullWidth
                variant="filled"
              />
              <RadioYesNo label="Do you have guests?" name="hasGuests" />
              {values.hasGuests === "yes" && (
                <Field
                  component={TextField}
                  label="Guest Names"
                  name="guests"
                  fullWidth
                  variant="filled"
                />
              )}
              <RadioYesNo
                label="Do you have any notes about your reservation for the Tech Staff?"
                name="hasNotes"
              />
              {values.hasNotes === "yes" && (
                <Field
                  component={TextField}
                  label="Notes"
                  name="notes"
                  fullWidth
                  multiline
                  rows={8}
                  variant="filled"
                />
              )}
              <RadioYesNo
                label="Would you like to reserve any equipment now?"
                name="hasEquipment"
              />
              {values.hasEquipment === "yes" && (
                <div>
                  <QuantityList
                    selectedEquipment={
                      values.equipment as { [k: string]: number }
                    }
                  />
                  <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    style={{ backgroundColor: "Yellow", color: "black" }}
                    disabled={isSubmitting}
                    onClick={(): void => setEquipmentFormIsOpen(true)}
                  >
                    Add Equipment
                  </Button>
                </div>
              )}
              <Button
                type="submit"
                size="small"
                variant="contained"
                disableElevation
                style={{ backgroundColor: "Green", color: "white" }}
                disabled={isSubmitting}
              >
                Confirm Reservation
              </Button>
              {values.hasEquipment === "yes" && (
                <EquipmentForm
                  open={equipmentFormIsOpen}
                  setOpen={setEquipmentFormIsOpen}
                  selectedEquipment={
                    values.equipment as { [k: string]: number }
                  }
                  setFieldValue={setFieldValue}
                />
              )}
              <pre>{JSON.stringify(values, null, 2)}</pre>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationForm;
