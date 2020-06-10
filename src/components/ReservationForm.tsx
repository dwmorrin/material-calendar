import React, {
  FunctionComponent,
  useEffect,
  useContext,
  useState,
} from "react";
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
import { AuthContext } from "./AuthContext";
import { makeTransition } from "./Transition";
import UserGroup from "../resources/UserGroup";
import { Formik } from "formik";
import * as Yup from "yup";
import EquipmentForm from "./EquipmentForm";
import QuantityList from "./QuantityList";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Equipment from "../resources/Equipment";
import { quantizeEquipment, buildDictionaries } from "../utils/equipment";

const useStyles = makeStyles(() => ({
  guests: {
    display: "none",
  },
  notes: {
    display: "none",
  },
  equipmentList: {
    display: "none",
  },
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
  const { user } = useContext(AuthContext);
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const equipment = quantizeEquipment(
    state.resources[ResourceKey.Equipment] as Equipment[]
  );
  const [filters, categories, quantities] = buildDictionaries(equipment);

  // Constant Declatations
  const classes = useStyles();
  const initialValidationSchema = Yup.object().shape({
    phone: Yup.string().required("Please Enter a Phone Number"),
    description: Yup.string().required("Please Enter a description"),
  });

  // State Declarations
  const [currentProject, setCurrentProject] = useState(projects[0]);
  const [isSubmitionCompleted, setSubmitionCompleted] = useState(false);
  const [liveToggle, setLiveValue] = React.useState("yes");
  const [guestToggle, setGuestValue] = React.useState("no");
  const [notesToggle, setNotesValue] = React.useState("no");
  const [equipmentListToggle, setEquipmentListValue] = React.useState("no");
  const [validationSchema, setValidationSchema] = React.useState(
    initialValidationSchema
  );

  // Once we have projects, if we still don't have a default currentProject, assign it now.
  if (projects[0]) {
    if (currentProject === undefined) {
      setCurrentProject(projects[0]);
    }
  }

  // HandleChange Functions
  const changeProject = (id: number): void => {
    const proj = projects.filter(function (project) {
      // eslint-disable-next-line
      return project.id == id;
    });
    setCurrentProject(proj[0]);
  };

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

  const toggleElement = (event: React.ChangeEvent<{}>, value: string): void => {
    const val = (event.target as HTMLInputElement).value;
    const element = document.getElementById(value);
    if (element != null) {
      if (val === "yes") {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
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
                project: currentProject,
                liveRoom: liveToggle,
                hasGuests: guestToggle,
                hasNotes: notesToggle,
                hasEquipment: equipmentListToggle,
                group: groups.filter(function (group) {return group.projectId === currentProject.id;})[0],
                equipment: quantities,
                filters,
              }}
              onSubmit={(values, { setSubmitting }): void => {
                setSubmitting(true);

                // sets the project property of values here because it
                // doesn't update fast enough to set in the handleChange
                values.project = currentProject;
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
                          value={currentProject ? currentProject.id : ""}
                          selectName="projects"
                          selectId="projectsDropDown"
                          contents={projects}
                          onChange={(event): void => {
                            changeProject(event?.target.value);
                          }}
                        ></Select>
                      </div>
                    </div>
                    <div className={classes.list}>
                      Group:{" "}
                      <div style={{ paddingLeft: 10 }}>
                        {groups
                          .filter(function (group) {
                            return group.projectId === currentProject.id;
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
                        aria-label="liveroom"
                        name="liveroom"
                        value={values.liveRoom}
                        onChange={(
                          event: React.ChangeEvent<{}>,
                          value
                        ): void => {
                          setLiveValue(value);
                          values.liveRoom = value;
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
                        name="guestsToggle"
                        value={values.hasGuests}
                        onChange={(
                          event: React.ChangeEvent<{}>,
                          value
                        ): void => {
                          setGuestValue(value);
                          requireGuests(event);
                          toggleElement(event, "guestInput");
                          values.hasGuests = value;
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
                    <div id="guestInput" className={classes.guests}>
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
                    </div>
                    <br />
                    <FormControl component="fieldset">
                      <FormLabel component="legend">
                        Do you have any notes about your reservation for the
                        Tech Staff?
                      </FormLabel>
                      <RadioGroup
                        aria-label="notes"
                        name="notes"
                        value={values.hasNotes}
                        onChange={(
                          event: React.ChangeEvent<{}>,
                          value
                        ): void => {
                          setNotesValue(value);
                          toggleElement(event, "notesInput");
                          values.hasNotes = value;
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
                    <div id="notesInput" className={classes.notes}>
                      <TextField
                        id="notes"
                        label="Notes"
                        fullWidth
                        multiline
                        rows={8}
                        variant="filled"
                      />
                    </div>
                    <br />
                    <FormControl component="fieldset">
                      <FormLabel component="legend">
                        Would you like to reserve any equipment now?
                      </FormLabel>
                      <RadioGroup
                        aria-label="equipment"
                        name="equipment"
                        value={values.hasEquipment}
                        onChange={(
                          event: React.ChangeEvent<{}>,
                          value
                        ): void => {
                          setEquipmentListValue(value);
                          toggleElement(event, "equipmentList");
                          values.hasEquipment = value;
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
                    <div id="equipmentList" className={classes.equipmentList}>
                      <br />
                      <QuantityList quantities={values.equipment} />
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
                      equipment={equipment}
                      quantities={values.equipment}
                      filters={values.filters}
                      visibleFilters={categories[values.currentCategory]}
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
