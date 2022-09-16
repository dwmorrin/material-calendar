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
import EquipmentCart from "./EquipmentForm/EquipmentCart";
import EquipmentForm from "./EquipmentForm/EquipmentForm";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";
import {
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
  allowsEquipment: boolean;
}

const ReservationForm: FunctionComponent<ReservationFormProps> = ({
  dispatch,
  state,
  projects,
  walkInValid,
  allowsEquipment,
}) => {
  const [equipmentFormIsOpen, setEquipmentFormIsOpen] = useState(false);
  const classes = useStyles();
  const { user } = useAuth();
  const { broadcast } = useSocket();

  const equipment = state.resources[ResourceKey.Equipment] as Equipment[];
  const allProjects = state.resources[ResourceKey.Projects] as Project[];
  const equipmentValues = makeEquipmentValues(equipment);

  const { currentEvent } = state;
  if (!currentEvent) return null;
  const { reservation } = currentEvent;

  let initialProject: Project | null = null;

  if (reservation) {
    const foundProject = allProjects.find(
      (p) => p.id === reservation.projectId
    );
    if (foundProject) initialProject = foundProject;
  }

  // If walk-in is valid, then user MUST use the walk-in option.
  if (!initialProject && walkInValid) {
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
    initialProject = maybeProject;
  } else if (!initialProject) initialProject = projects[0] || new Project();

  const getGroupByProjectId = (projectId: number): UserGroup | undefined =>
    (state.resources[ResourceKey.Groups] as UserGroup[]).find(
      (g) => g.projectId === projectId
    );

  const initialGroup = getGroupByProjectId(initialProject?.id || 0);
  if (!initialGroup) return null;

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

  const isNotWalkIn =
    !walkInValid && initialProject?.title !== Project.walkInTitle;
  // TODO: this is a hack to ensure the project gets included into the available projects
  // TODO: review the logic that determines the 'projects' array
  if (!projects.find((p) => p.id === initialProject?.id))
    projects.push(initialProject);

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
            initialGroup,
            equipmentValues,
            initialProject
          )}
          onSubmit={submitHandler({
            broadcast,
            closeForm,
            dispatch,
            user,
            event: currentEvent,
            groups: state.resources[ResourceKey.Groups] as UserGroup[],
            projects: state.resources[ResourceKey.Projects] as Project[],
          })}
        >
          {({ values, isSubmitting, setFieldValue, handleSubmit }): unknown => (
            <Form className={classes.list} onSubmit={handleSubmit}>
              <FormLabel>Project:</FormLabel>
              {isNotWalkIn ? (
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
              {getGroupByProjectId(values.projectId)?.title ||
                "Error: no group found!"}
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
              {values.hasGuests === "yes" &&
                !!process.env.REACT_APP_GUEST_FORM_TEXT &&
                !!process.env.REACT_APP_GUEST_FORM_LINK_TEXT &&
                !!process.env.REACT_APP_GUEST_FORM_LINK_URL && (
                  <div>
                    {process.env.REACT_APP_GUEST_FORM_TEXT}{" "}
                    <a
                      href={process.env.REACT_APP_GUEST_FORM_LINK_URL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {process.env.REACT_APP_GUEST_FORM_LINK_TEXT}
                    </a>
                  </div>
                )}
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
              {allowsEquipment ? (
                <RadioYesNo
                  label="Would you like to reserve any equipment now?"
                  name="hasEquipment"
                  className={classes.item}
                />
              ) : (
                "Equipment cannot be reserved for this location."
              )}
              {values.hasEquipment === "yes" && (
                <section className={classes.list}>
                  <EquipmentCart
                    selectedEquipment={values.equipment}
                    setFieldValue={setFieldValue}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!allowsEquipment || isSubmitting}
                    onClick={(): void => setEquipmentFormIsOpen(true)}
                  >
                    {allowsEquipment ? (
                      "Select equipment"
                    ) : (
                      <FormLabel component="legend">
                        Equipment cannot be reserved in this location
                      </FormLabel>
                    )}
                  </Button>
                </section>
              )}
              <Button
                className={classes.item}
                color="primary"
                type="submit"
                size="small"
                variant="contained"
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
