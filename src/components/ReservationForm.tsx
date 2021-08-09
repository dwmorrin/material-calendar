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
} from "../calendar/reservationForm";
import { useAuth } from "./AuthProvider";
import fetchCurrentEvent from "../calendar/fetchCurrentEvent";
import Equipment from "../resources/Equipment";
import Category from "../resources/Category";

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
  const classes = useStyles();
  const closeForm = (): void => {
    dispatch({ type: CalendarAction.CloseReservationForm });
    if (state.currentEvent) fetchCurrentEvent(dispatch, state.currentEvent);
  };
  const { user } = useAuth();

  if (!state.currentEvent) return null;
  const project = projects[0] || new Project();
  const group = (state.resources[ResourceKey.Groups] as UserGroup[]).find(
    ({ projectId }) => projectId === project.id
  );
  if (!group) return null;
  const equipment = state.resources[ResourceKey.Equipment] as Equipment[];
  const categories = state.resources[ResourceKey.Categories] as Category[];

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
        <Typography variant="h6">
          {state.currentEvent.reservation
            ? "Update Reservation"
            : "Make Reservation"}
        </Typography>
      </Toolbar>

      <DialogContent>
        <Formik
          initialValues={makeInitialValues(
            state.currentEvent,
            group,
            equipment,
            project
          )}
          onSubmit={submitHandler(
            closeForm,
            dispatch,
            user,
            state.currentEvent,
            state.resources[ResourceKey.Groups] as UserGroup[],
            state.resources[ResourceKey.Projects] as Project[]
          )}
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
              <FormLabel className={classes.item}>Group:</FormLabel>
              {group.members.map(({ username, name }) => (
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
                label="Do you have any notes about your reservation for the Tech Staff? (Please do not put equipment requests in the notes)"
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
                    Open equipment shopping cart
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
                  categories={categories}
                />
              )}
              <pre>
                {process.env.NODE_ENV === "development" &&
                  JSON.stringify(values, null, 2)}
              </pre>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationForm;
