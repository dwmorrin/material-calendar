import React, {
  FunctionComponent,
  useEffect,
  useContext,
  useState
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
  DialogActions,
  DialogContent,
  Button
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Select from "./Select";
import { AuthContext } from "./AuthContext";
import { makeTransition } from "./Transition";
import UserGroup from "../user/UserGroup";
import { Formik } from "formik";
import * as Yup from "yup";
import Database from "./Database.js";
import GearForm from "./GearForm";
import Gear from "../resources/Gear";

const useStyles = makeStyles(() => ({
  guests: {
    display: "none"
  },
  notes: {
    display: "none"
  },
  list: {
    display: "flex",
    justifyContent: "flex-start",
    alignContent: "row"
  }
}));

const transition = makeTransition("left");

const ReservationForm: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state
}) => {
  // Get values from App
  const { user } = useContext(AuthContext);
  const projects = state.projects.filter((project) =>
    user?.projectIds.includes(project.id)
  );

  // Constant Declatations
  const initialGroups: UserGroup[] = [];
  const classes = useStyles();
  const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
  const initialValidationSchema = Yup.object().shape({
    phone: Yup.string().matches(phoneRegExp, "Phone number is not valid"),
    description: Yup.string().required("Required")
  });

  // State Declarations
  const initialProject = projects[0];
  const [currentProject, setCurrentProject] = useState(initialProject);
  const [groups, setGroups] = useState(initialGroups);
  const [isSubmitionCompleted, setSubmitionCompleted] = useState(false);
  const [liveToggle, setLiveValue] = React.useState("yes");
  const [guestToggle, setGuestValue] = React.useState("no");
  const [notesToggle, setNotesValue] = React.useState("no");
  const [validationSchema, setValidationSchema] = React.useState(
    initialValidationSchema
  );
  const [selectedGroup, setSelectedGroup] = useState("");

  // Get Groups from Server
  useEffect(() => {
    fetch(`/api/project_groups/${currentProject?.id}`)
      .then((response) => response.json())
      .then((groups) => {
        const usergroups = groups.map(
          (group: UserGroup) => new UserGroup(group)
        );
        setGroups(usergroups);
      })
      .catch(console.error);
  }, [currentProject, user]);

  // Once we have projects, if we still don't have a default currentProject, assign it now.
  if (projects[0]) {
    if (currentProject === undefined) {
      setCurrentProject(projects[0]);
    }
  }

  // HandleChange Functions
  const changeProject = (id: number): void => {
    const proj = state.projects.filter(function (project) {
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
          phone: Yup.string().matches(phoneRegExp, "Phone number is not valid"),
          description: Yup.string().required("Required"),
          guests: Yup.string().required("Required")
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

  function quantizeGear(gear: Gear[]): Gear[] {
    const tempArray: Gear[] = [];
    for (let i = 0; i < gear.length; ++i) {
      const item = gear[i];
      item.quantity = gear.filter(
        (element) => element.title === item.title
      ).length;
      const index = tempArray.findIndex(
        (element) => element.title === item.title
      );
      if (index === -1) {
        tempArray.push(item);
      }
    }
    return tempArray;
  }

  function cleanName(name: string): string {
    name = name.trim();
    const words = name.split(" ");
    name = "";
    for (let index = 0; index < words.length; ++index) {
      const word = words[index].charAt(0).toUpperCase() + words[index].slice(1);
      name = name + word + " ";
    }
    return name.trim();
  }

  const changeCurrentGroup = (group: string): void => {
    if (group === selectedGroup) {
      setSelectedGroup("");
    } else {
      setSelectedGroup(group);
    }
  };

  //const gear: Gear[] = quantizeGear(state.gear);
  const gear: Gear[] = quantizeGear(Database.gear);
  const quantities: { [k: string]: number } = {};
  gear.forEach((item) => (quantities[item.title] = 0));

  const filters: { [k: string]: boolean } = {};
  gear.forEach((item) =>
    item.tags.split(",").forEach((tag) => (filters[cleanName(tag)] = false))
  );

  const categories: { [k: string]: Set<string> } = {};
  gear.forEach((item) =>
    item.tags.split(",").forEach((tag) => {
      if (!categories[cleanName(item.parentId)]) {
        categories[cleanName(item.parentId)] = new Set();
      }
      categories[item.parentId].add(cleanName(tag));
    })
  );

  return (
    <Dialog
      fullScreen
      open={state.ReservationFormIsOpen}
      TransitionComponent={transition}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close1"
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
                phone: "",
                description: "",
                guests: "",
                project: currentProject,
                liveRoom: liveToggle,
                hasGuests: guestToggle,
                hasNotes: notesToggle,
                group: initialGroups[0],
                quantities,
                filters
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
                  handleBlur,
                  handleSubmit
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
                          .filter((group) => user?.groupIds.includes(group.id))
                          .map((group) => {
                            values.group = group;
                            return (
                              <span key={group.id}>
                                {group.title}
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
                    {/* this may currently cause issues with the content being
                  required conditionally */}
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
                    <Button
                      size="small"
                      variant="contained"
                      disableElevation
                      style={{ backgroundColor: "Yellow", color: "black" }}
                      disabled={isSubmitting}
                      onClick={(event): void => {
                        event.stopPropagation();
                        dispatch({
                          type: CalendarAction.OpenGearForm
                        });
                      }}
                    >
                      Reserve Equipment
                    </Button>
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
                    <GearForm
                      dispatch={dispatch}
                      state={state}
                      gear={gear}
                      quantities={values.quantities}
                      filters={values.filters}
                      visibleFilters={categories[selectedGroup]}
                      handleChange={handleChange}
                      selectedGroup={selectedGroup}
                      changeCurrentGroup={changeCurrentGroup}
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
