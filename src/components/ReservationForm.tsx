import React, { FunctionComponent, useState } from "react";
import TextField from "@material-ui/core/TextField";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  IconButton,
  makeStyles,
  Dialog,
  Toolbar,
  Typography,
  DialogContent,
  Button,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Select from "./Select";
import { makeTransition } from "./Transition";
import UserGroup from "../resources/UserGroup";
import { Formik } from "formik";
import * as Yup from "yup";
import EquipmentForm from "./EquipmentForm";
import QuantityList from "./QuantityList";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import { findProjectById } from "../utils/project";

const useStyles = makeStyles(() => ({
  list: {
    display: "flex",
    justifyContent: "flex-start",
    alignContent: "row",
  },
}));

const transition = makeTransition("left");

const ReservationForm: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  // Get values from App
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const projects = state.resources[ResourceKey.Projects] as Project[];
  // Constant Declatations
  const classes = useStyles();
  const initialValidationSchema = Yup.object().shape({
    phone: Yup.string().required("Please Enter a Phone Number"),
    description: Yup.string().required("Please Enter a description"),
  });

  // State Declarations
  const [isSubmitionCompleted, setSubmitionCompleted] = useState(false);
  const [validationSchema, setValidationSchema] = React.useState(
    initialValidationSchema
  );

  // HandleChange Functions
  const requireGuests = (event: React.ChangeEvent<{}>): void => {
    const val = (event.target as HTMLInputElement).value;
    if (val === "yes") {
      setValidationSchema(
        Yup.object().shape({
          phone: Yup.string().required("Please Enter a Phone Number"),
          description: Yup.string().required("Please Enter a description"),
          guests: Yup.string().required(
            "Please enter the names of your guests"
          ),
        })
      );
    } else {
      setValidationSchema(initialValidationSchema);
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
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseReservationForm })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Make Reservation</Typography>
      </Toolbar>

      {!isSubmitionCompleted && (
        <React.Fragment>
          <DialogContent>
            <Formik
              initialValues={{
                event: state.currentEvent,
                currentCategory: "",
                searchString: "",
                phone: "",
                description: "",
                guests: "",
                project: projects[0],
                liveRoom: "no",
                hasGuests: "no",
                hasNotes: "no",
                hasEquipment: "no",
                group: groups.filter(function (group) {
                  return group.projectId === projects[0].id;
                })[0],
                equipment: {},
                filters: {},
              }}
              onSubmit={(values, { setSubmitting }): void => {
                setSubmitting(true);

                // sets the project property of values here because it
                // doesn't update fast enough to set in the handleChange
                setTimeout(() => {
                  console.log(values);
                  setSubmitionCompleted(true);
                }, 2000);
              }}
              validationSchema={validationSchema}
            >
              {(props): any => {
                const {
                  values,
                  touched,
                  errors,
                  isSubmitting,
                  handleChange,
                  setFieldValue,
                  handleBlur,
                  handleSubmit,
                } = props;
                return (
                  <form onSubmit={handleSubmit}>
                    <div className={classes.list}>
                      <div style={{ paddingTop: 16 }}>Project:</div>
                      <div style={{ paddingLeft: 5 }}>
                        <Select
                          dispatch={dispatch}
                          state={state}
                          value={values.project.id}
                          selectName="projects"
                          selectId="projectsDropDown"
                          contents={projects}
                          onChange={(event): void => {
                            setFieldValue(
                              "project",
                              findProjectById(projects, event?.target.value)
                            );
                          }}
                        ></Select>
                      </div>
                    </div>
                    <div className={classes.list}>
                      Group:{" "}
                      <div style={{ paddingLeft: 10 }}>
                        {groups
                          .filter(function (group) {
                            return group.projectId === values.project.id;
                          })[0]
                          .members.map((user) => {
                            return (
                              <span key={user.username}>
                                {user.name.first + " " + user.name.last}
                                <br />
                              </span>
                            );
                          })}
                      </div>
                    </div>
                    <br />
                    <TextField
                      label="Brief Description of what you will be doing"
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={
                        errors.description &&
                        touched.description &&
                        errors.description
                      }
                      fullWidth
                      variant="filled"
                    />
                    <br />
                    <br />
                    <FormControl component="fieldset">
                      <FormLabel component="legend">
                        Do you need to use the Live Room?
                      </FormLabel>
                      <RadioGroup
                        aria-label="liveRoom"
                        name="liveRoom"
                        value={values.liveRoom}
                        onChange={handleChange}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                    <br />
                    <TextField
                      label="Phone Number"
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={errors.phone && touched.phone && errors.phone}
                      fullWidth
                      variant="filled"
                    />
                    <br />
                    <br />
                    <FormControl component="fieldset">
                      <FormLabel component="legend">
                        Do you have guests?
                      </FormLabel>
                      <RadioGroup
                        aria-label="guestsToggle"
                        name="hasGuests"
                        value={values.hasGuests}
                        onChange={(
                          event: React.ChangeEvent<{}>,
                          value
                        ): void => {
                          setFieldValue("hasGuests", value);
                          requireGuests(event);
                        }}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                    <br />
                    {values.hasGuests === "yes" && (
                      <TextField
                        label="Guest Names"
                        name="guests"
                        value={values.guests}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText={
                          errors.guests && touched.guests && errors.guests
                        }
                        fullWidth
                        variant="filled"
                      />
                    )}
                    <br />
                    <FormControl component="fieldset">
                      <FormLabel component="legend">
                        Do you have any notes about your reservation for the
                        Tech Staff?
                      </FormLabel>
                      <RadioGroup
                        aria-label="notes"
                        name="hasNotes"
                        value={values.hasNotes}
                        onChange={handleChange}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                    {values.hasNotes === "yes" && (
                      <TextField
                        id="notes"
                        label="Notes"
                        fullWidth
                        multiline
                        rows={8}
                        variant="filled"
                      />
                    )}
                    <br />
                    <FormControl component="fieldset">
                      <FormLabel component="legend">
                        Would you like to reserve any equipment now?
                      </FormLabel>
                      <RadioGroup
                        aria-label="equipment"
                        name="hasEquipment"
                        value={values.hasEquipment}
                        onChange={handleChange}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                    {values.hasEquipment === "yes" && (
                      <div>
                        <br />
                        <QuantityList selectedEquipment={values.equipment} />
                        <Button
                          size="small"
                          variant="contained"
                          disableElevation
                          style={{ backgroundColor: "Yellow", color: "black" }}
                          disabled={isSubmitting}
                          onClick={(event): void => {
                            event.stopPropagation();
                            dispatch({
                              type: CalendarAction.OpenEquipmentForm,
                            });
                          }}
                        >
                          Add Equipment
                        </Button>
                      </div>
                    )}
                    <br />
                    <br />
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
                    <EquipmentForm
                      dispatch={dispatch}
                      state={state}
                      selectedEquipment={values.equipment}
                      filters={values.filters}
                      currentCategory={values.currentCategory}
                      setFieldValue={setFieldValue}
                    />
                  </form>
                );
              }}
            </Formik>
          </DialogContent>
        </React.Fragment>
      )}
      {isSubmitionCompleted && <div>Reservation Submitted!</div>}
    </Dialog>
  );
};

export default ReservationForm;
