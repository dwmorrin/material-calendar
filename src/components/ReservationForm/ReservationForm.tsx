import React, { FunctionComponent, useState } from "react";
import { CalendarUIProps, CalendarAction } from "../types";
import {
  Button,
  Dialog,
  DialogContent,
  FormLabel,
  IconButton,
  MenuItem,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Select, TextField } from "formik-material-ui";
import CloseIcon from "@material-ui/icons/Close";
import UserGroup from "../../resources/UserGroup";
import { Field, Form, Formik } from "formik";
import EquipmentForm from "./EquipmentForm/EquipmentForm";
import QuantityList from "./EquipmentForm/QuantityList";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";
import {
  validationSchema,
  makeInitialValues,
  useStyles,
  submitHandler,
  transition,
  makeEquipmentValues,
} from "./lib";
import { useAuth } from "../AuthProvider";
import { useSocket, SocketMessageKind } from "../SocketProvider";
import fetchCurrentEvent from "../fetchCurrentEvent";
import Equipment from "../../resources/Equipment";
import Event from "../../resources/Event";
import Category from "../../resources/Category";
import RadioYesNo from "../RadioYesNo";

interface ReservationFormProps extends CalendarUIProps {
  projects: Project[];
  walkInValid: boolean;
}

const ReservationForm: FunctionComponent<ReservationFormProps> = ({
  dispatch,
  state,
  projects,
  walkInValid,
}) => {
  const [equipmentFormIsOpen, setEquipmentFormIsOpen] = useState(false);
  const classes = useStyles();
  const { user } = useAuth();
  const { broadcast } = useSocket();

  const equipment = state.resources[ResourceKey.Equipment] as Equipment[];
  const equipmentValues = makeEquipmentValues(equipment);

  const { currentEvent } = state;
  if (!currentEvent) return null;
  const { reservation } = currentEvent;

  // If walk-in is valid, then user MUST use the walk-in option.
  let project: Project;
  if (walkInValid) {
    const maybeProject = (
      state.resources[ResourceKey.Projects] as Project[]
    ).find((p) => Project.walkInTitle === p.title);
    if (!maybeProject) {
      // impossible state: walkInValid would be false
      // eslint-disable-next-line no-console
      console.error(
        "impossible state: walkInValid is true, but no walk-in project found"
      );
      return null;
    }
    project = maybeProject;
  } else project = projects[0] || new Project();

  if (reservation) {
    const foundProject = projects.find((p) => p.id === reservation.projectId);
    if (foundProject) project = foundProject;
  }
  const group = (state.resources[ResourceKey.Groups] as UserGroup[]).find(
    ({ projectId }) => projectId === project.id
  );
  if (!group) return null;
  const categories = state.resources[ResourceKey.Categories] as Category[];

  const closeForm = (): void => {
    dispatch({ type: CalendarAction.CloseReservationForm });
    if (!reservation) {
      broadcast(SocketMessageKind.EventUnlock, currentEvent.id);
      fetch(`${Event.url}/${currentEvent.id}/unlock`, { method: "POST" }).then(
        () => {
          if (state.currentEvent)
            fetchCurrentEvent(dispatch, state.currentEvent);
        }
      );
    } else {
      if (state.currentEvent) fetchCurrentEvent(dispatch, state.currentEvent);
    }
  };

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
          {reservation ? "Update Reservation" : "Make Reservation"}
        </Typography>
      </Toolbar>

      <DialogContent>
        <Formik
          initialValues={makeInitialValues(
            currentEvent,
            group,
            equipmentValues,
            project
          )}
          onSubmit={submitHandler({
            closeForm,
            dispatch,
            user,
            event: currentEvent,
            groups: state.resources[ResourceKey.Groups] as UserGroup[],
            projects: state.resources[ResourceKey.Projects] as Project[],
          })}
          validationSchema={validationSchema}
        >
          {({ values, isSubmitting, setFieldValue, handleSubmit }): unknown => (
            <Form className={classes.list} onSubmit={handleSubmit}>
              <FormLabel>Project:</FormLabel>
              {!walkInValid && project.title !== Project.walkInTitle ? (
                <Field component={Select} name="projectId">
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.title}
                    </MenuItem>
                  ))}
                </Field>
              ) : (
                <Typography variant="subtitle1">Walk-In</Typography>
              )}
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
                  categories={categories}
                  equipment={values.__equipment__}
                  event={state.currentEvent}
                  open={equipmentFormIsOpen}
                  selectedEquipment={values.equipment}
                  setFieldValue={setFieldValue}
                  setOpen={setEquipmentFormIsOpen}
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
