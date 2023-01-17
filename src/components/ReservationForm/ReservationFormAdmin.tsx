// allows admin user to create reservations without normal limitations
// admin can freely assign project and group

import React, { FC, useEffect, useState } from "react";
import {
  Action,
  CalendarUIProps,
  CalendarAction,
  CalendarState,
} from "../types";
import {
  Button,
  Dialog,
  DialogActions,
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
import Event, { ReservationInfo } from "../../resources/Event";
import Reservation from "../../resources/Reservation";
import {
  makeInitialValues,
  useStyles,
  submitHandler,
  transition,
  makeEquipmentValues,
} from "./lib";
import { useAuth } from "../AuthProvider";
import fetchCurrentEvent from "../fetchCurrentEvent";
import Equipment from "../../resources/Equipment";
import Category from "../../resources/Category";
import User from "../../resources/User";
import RadioYesNo from "../RadioYesNo";
import { useSocket } from "../SocketProvider";
import { addEvents } from "../../resources/EventsByDate";

const cancelReservation = ({
  eventId,
  state,
  dispatch,
  refund,
  reservation,
  user,
  cleanup,
}: {
  eventId: number;
  state: CalendarState;
  dispatch: (action: Action) => void;
  refund: boolean;
  reservation?: ReservationInfo;
  user: User;
  cleanup: () => void;
}): void => {
  if (!reservation) return;
  const body = {
    eventIds: [eventId],
    userId: user.id,
    refundApproved: refund,
  };
  fetch(`${Reservation.url}/cancel/${reservation.id}`, {
    method: "PUT",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then(({ error, data }) => {
      if (error) throw error;
      const { events, reservations } = data;
      if (!Array.isArray(events) || !Array.isArray(reservations))
        throw new Error(
          "No update was returned from server after cancelation request"
        );
      const updatedEvents = events.map((e) => new Event(e));
      const eventsFromState = state.resources[ResourceKey.Events] as Event[];
      for (const event of updatedEvents) {
        const i = eventsFromState.findIndex((e) => e.id === event.id);
        if (i === -1) eventsFromState.push(event);
        else eventsFromState[i] = event;
      }
      dispatch({
        type: CalendarAction.CanceledReservationAdmin,
        payload: {
          events: addEvents(state.events, updatedEvents),
          resources: {
            [ResourceKey.Events]: eventsFromState,
            [ResourceKey.Reservations]: (reservations as Reservation[]).map(
              (r) => new Reservation(r)
            ),
          },
        },
      });
    })
    .catch((error) =>
      dispatch({ type: CalendarAction.Error, payload: { error } })
    )
    .finally(() => cleanup());
};

const ReservationForm: FC<CalendarUIProps> = ({ dispatch, state }) => {
  const [equipmentFormIsOpen, setEquipmentFormIsOpen] = useState(false);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cancelDialogIsOpen, setCancelDialogIsOpen] = useState<boolean>(false);
  const [cancelIsSubmitting, setCancelIsSubmitting] = useState<boolean>(false);
  const classes = useStyles();
  const closeForm = (): void => {
    dispatch({ type: CalendarAction.CloseReservationFormAdmin });
    if (state.currentEvent) fetchCurrentEvent(dispatch, state.currentEvent);
  };
  const { user } = useAuth();
  const { broadcast } = useSocket();
  const equipment = state.resources[ResourceKey.Equipment] as Equipment[];
  const equipmentValues = makeEquipmentValues(equipment);

  const currentEvent = state.currentEvent || new Event();
  const categories = state.resources[ResourceKey.Categories] as Category[];

  useEffect(() => {
    const dispatchError = (error: Error): void =>
      dispatch({ type: CalendarAction.Error, payload: { error } });
    fetch(UserGroup.url)
      .then((res) => res.json())
      .then(({ error, data }) => {
        if (error) throw error;
        if (!data) throw new Error("No groups found");
        const groups = (data as UserGroup[]).map((g) => new UserGroup(g));
        setGroups(groups);
      })
      .catch(dispatchError);
    fetch(Project.url)
      .then((res) => res.json())
      .then(({ error, data }) => {
        if (error) throw error;
        if (!data) throw new Error("No projects found");
        const projects = (data as Project[]).map((p) => new Project(p));
        setProjects(projects);
      })
      .catch(dispatchError);
  }, [dispatch]);

  const initialGroup = groups[0] || new UserGroup();
  const initialProject = projects[0] || new Project();

  return (
    <Dialog
      fullScreen
      open={state.reservationFormAdminIsOpen}
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
          {currentEvent.reservation ? "Update Reservation" : "Make Reservation"}
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
            groups,
            projects,
            isAdmin: true,
          })}
        >
          {({ values, isSubmitting, setFieldValue, handleSubmit }): unknown => (
            <Form className={classes.list} onSubmit={handleSubmit}>
              <FormLabel>Project:</FormLabel>
              <Field component={Select} name="projectId">
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title}
                  </MenuItem>
                ))}
              </Field>
              <FormLabel className={classes.item}>Group:</FormLabel>
              <Field component={Select} name="groupId">
                {groups
                  .filter(({ projectId }) => projectId === values.projectId)
                  .map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.title}
                    </MenuItem>
                  ))}
              </Field>
              <RadioYesNo
                label="Send email?"
                name="sendEmail"
                className={classes.item}
              />
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
                color="primary"
                className={classes.item}
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {currentEvent.reservation
                  ? "Update Reservation"
                  : "Confirm Reservation"}
              </Button>
              {currentEvent.reservation && (
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={(): void => setCancelDialogIsOpen(true)}
                  disabled={isSubmitting}
                >
                  Cancel Reservation
                </Button>
              )}
              {values.hasEquipment === "yes" && currentEvent && (
                <EquipmentForm
                  categories={categories}
                  equipment={values.__equipment__}
                  event={currentEvent}
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
      <Dialog open={cancelDialogIsOpen}>
        <DialogContent>Cancel this reservation?</DialogContent>
        <DialogActions>
          <Button
            disabled={cancelIsSubmitting}
            variant="contained"
            onClick={(): void => {
              setCancelIsSubmitting(true);
              cancelReservation({
                eventId: currentEvent.id,
                state,
                dispatch,
                refund: false,
                reservation: currentEvent.reservation,
                user,
                cleanup: () => setCancelDialogIsOpen(false),
              });
            }}
          >
            {cancelIsSubmitting ? "Sending..." : "Yes, Cancel without refund"}
          </Button>
          <Button
            disabled={cancelIsSubmitting}
            variant="contained"
            onClick={(): void => {
              setCancelIsSubmitting(true);
              cancelReservation({
                eventId: currentEvent.id,
                state,
                dispatch,
                refund: true,
                reservation: currentEvent.reservation,
                user,
                cleanup: () => setCancelDialogIsOpen(false),
              });
            }}
          >
            {cancelIsSubmitting ? "Sending..." : "Yes, Cancel and refund hours"}
          </Button>
          <Button
            disabled={cancelIsSubmitting}
            variant="contained"
            onClick={(): void => setCancelDialogIsOpen(false)}
          >
            No, go back
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ReservationForm;
