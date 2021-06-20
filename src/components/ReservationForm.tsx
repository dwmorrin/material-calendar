import React, { FunctionComponent, useState } from "react";
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
  getValuesFromReservation,
} from "../calendar/reservationForm";

const RadioYesNo: FunctionComponent<{
  label: string;
  name: string;
  className: string;
}> = ({ label, name, className }) => (
  <section className={className}>
    <FormLabel component="legend">{label}</FormLabel>
    <Field component={RadioGroup} name={name}>
      <FormControlLabel value="yes" control={<Radio />} label="Yes" />
      <FormControlLabel value="no" control={<Radio />} label="No" />
    </Field>
  </section>
);

interface ReservationFormProps extends CalendarUIProps {
  projects: Project[];
}

const ReservationForm: FunctionComponent<ReservationFormProps> = ({
  dispatch,
  state,
  projects,
}) => {
  const [equipmentFormIsOpen, setEquipmentFormIsOpen] = useState(false);
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const findGroup = (id: number): UserGroup | undefined => {
    return groups.find((group) => group.projectId === id);
  };
  new UserGroup();
  const classes = useStyles();
  const closeForm = (): void =>
    dispatch({ type: CalendarAction.CloseReservationForm });

  const displayMessage = (message: string): void =>
    dispatch({
      type: CalendarAction.DisplayMessage,
      payload: { message: message },
    });

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
          onClick={closeForm}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Make Reservation</Typography>
      </Toolbar>

      <DialogContent>
        <Formik
          initialValues={
            getValuesFromReservation(state.currentEvent) ||
            makeInitialValues(state, projects)
          }
          onSubmit={submitHandler(closeForm, displayMessage)}
          validationSchema={validationSchema}
        >
          {({ values, isSubmitting, setFieldValue, handleSubmit }): unknown => (
            <Form className={classes.list} onSubmit={handleSubmit}>
              <FormLabel>Project:</FormLabel>
              <Field
                component={Select}
                name="project"
                onClick={(event: { target: { value: number } }): void => {
                  setFieldValue(
                    "groupId",
                    findGroup(event.target.value)?.id || values.groupId
                  );
                }}
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title}
                  </MenuItem>
                ))}
              </Field>
              <FormLabel className={classes.item}>Group:</FormLabel>
              {(
                groups.find((group) => group.projectId === values.project) ||
                new UserGroup()
              ).members.map(({ username, name }) => (
                <Typography key={username}>
                  {`${name.first} ${name.last}`}
                </Typography>
              ))}
              <FormLabel className={classes.item}>Description</FormLabel>
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
                className={classes.item}
              />
              <FormLabel className={classes.item}>Phone</FormLabel>
              <Field
                component={TextField}
                label="Phone Number"
                name="phone"
                fullWidth
                variant="filled"
              />
              <RadioYesNo
                label="Do you have guests?"
                name="hasGuests"
                className={classes.item}
              />
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
                className={classes.item}
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
                className={classes.item}
              />
              {values.hasEquipment === "yes" && (
                <section className={classes.list}>
                  <QuantityList selectedEquipment={values.equipment} />
                  <Button
                    className={classes.addEquipment}
                    size="small"
                    variant="contained"
                    disableElevation
                    disabled={isSubmitting}
                    onClick={(): void => setEquipmentFormIsOpen(true)}
                  >
                    {Object.keys(values.equipment).length > 0
                      ? "Add/Remove Equipment"
                      : "Add Equipment"}
                  </Button>
                </section>
              )}
              <Button
                className={classes.item}
                type="submit"
                size="small"
                variant="contained"
                disableElevation
                style={{ backgroundColor: "Green", color: "white" }}
                disabled={isSubmitting}
              >
                {state.currentEvent?.reservation
                  ? "Update Reservation"
                  : "Confirm Reservation"}
              </Button>
              {values.hasEquipment === "yes" && state.currentEvent && (
                <EquipmentForm
                  open={equipmentFormIsOpen}
                  setOpen={setEquipmentFormIsOpen}
                  selectedEquipment={values.equipment}
                  setFieldValue={setFieldValue}
                  event={state.currentEvent}
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
