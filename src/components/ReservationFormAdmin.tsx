// allows admin user to create reservations without normal limitations
// admin can freely assign project and group

import React, { FC, useEffect, useState } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
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
import UserGroup from "../resources/UserGroup";
import { Field, Form, Formik } from "formik";
import EquipmentForm from "./EquipmentForm";
import QuantityList from "./QuantityList";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Event from "../resources/Event";
import {
  validationSchema,
  makeInitialValues,
  useStyles,
  submitHandler,
  transition,
  makeEquipmentValues,
} from "../calendar/reservationForm";
import { useAuth } from "./AuthProvider";
import fetchCurrentEvent from "../calendar/fetchCurrentEvent";
import Equipment from "../resources/Equipment";
import Category from "../resources/Category";
import RadioYesNo from "./RadioYesNo";

const ReservationForm: FC<CalendarUIProps> = ({ dispatch, state }) => {
  const [equipmentFormIsOpen, setEquipmentFormIsOpen] = useState(false);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const classes = useStyles();
  const closeForm = (): void => {
    dispatch({ type: CalendarAction.CloseReservationFormAdmin });
    if (state.currentEvent) fetchCurrentEvent(dispatch, state.currentEvent);
  };
  const { user } = useAuth();
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

  const group = groups[0] || new UserGroup();
  const project = projects[0] || new Project();

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
            group,
            equipmentValues,
            project
          )}
          onSubmit={submitHandler(
            closeForm,
            dispatch,
            user,
            currentEvent,
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
              <Field component={Select} name="groupId">
                {groups
                  .filter(({ projectId }) => projectId === values.project)
                  .map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.title}
                    </MenuItem>
                  ))}
              </Field>
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
                {currentEvent.reservation
                  ? "Update Reservation"
                  : "Confirm Reservation"}
              </Button>
              {values.hasEquipment === "yes" && currentEvent && (
                <EquipmentForm
                  open={equipmentFormIsOpen}
                  setOpen={setEquipmentFormIsOpen}
                  selectedEquipment={values.equipment}
                  setFieldValue={setFieldValue}
                  event={currentEvent}
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
