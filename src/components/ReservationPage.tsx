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
  DialogActions,
  DialogContent,
  Button,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Select from "./Select";
import { AuthContext } from "./AuthContext";
import { makeTransition } from "./Transition";
import UserGroup from "../user/UserGroup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  right: {
    display: "flex",
    justifyContent: "flex-end",
  },
  center: {
    display: "flex",
    justifyContent: "center",
  },
  guests: {
    display: "none",
  },
  notes: {
    display: "none",
  },
  left: {
    display: "flex",
    justifyContent: "flex-start",
    margin: 0,
  },
  list: {
    display: "flex",
    justifyContent: "flex-start",
    alignContent: "row",
  },
  test: {
    margin: 0,
  },
  container: {
    flexWrap: "wrap",
  },
  textField: {
    width: 200,
  },
  alignSelect: {
    marginTop: "auto",
  },
  text: {
    paddingTop: "10px",
  },
}));

const transition = makeTransition("left");
const initialGroups: UserGroup[] = [];

const ReservationPage: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const [isSubmitionCompleted, setSubmitionCompleted] = useState(false);
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState(initialGroups);
  const projects = state.projects.filter((project) =>
    user?.projectIds.includes(project.id)
  );
  const initialProject = projects[0];
  const [currentProject, setCurrentProject] = useState(initialProject);

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

  const classes = useStyles();

  const [liveToggle, setLiveValue] = React.useState("yes");
  const [guestToggle, setGuestValue] = React.useState("no");
  const [notesToggle, setNotesValue] = React.useState("no");

  const changeProject = (id: number): void => {
    const proj = state.projects.filter(function (project) {
      // eslint-disable-next-line
      return project.id == id;
    });
    setCurrentProject(proj[0]);
  };

  const liveRoomChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setLiveValue((event.target as HTMLInputElement).value);
  };

  const showGuests = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setGuestValue((event.target as HTMLInputElement).value);
    const val = (event.target as HTMLInputElement).value;
    const element = document.getElementById("guestInput");
    if (element != null) {
      if (val === "yes") {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
  };

  const showNotes = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setNotesValue((event.target as HTMLInputElement).value);
    const val = (event.target as HTMLInputElement).value;
    const element = document.getElementById("notesInput");
    if (element != null) {
      if (val === "yes") {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
  };

  // Once we have projects, if we still don't have a default currentProject, assign it now.
  if (projects[0]) {
    if (currentProject === undefined) {
      setCurrentProject(projects[0]);
    }
  }
  const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

  return (
    <Dialog
      fullScreen
      open={state.reservationPageIsOpen}
      TransitionComponent={transition}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close1"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseReservationPage })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Make Reservation</Typography>
      </Toolbar>
      <React.Fragment>
        <DialogContent>
          <Formik
            initialValues={{ phone: "", description: "", guests: "" }}
            onSubmit={(values, { setSubmitting }) => {
              return undefined;
            }}
            validationSchema={Yup.object().shape({
              phone: Yup.string().matches(
                phoneRegExp,
                "Phone number is not valid"
              ),
              description: Yup.string().required("Required"),
              guests: Yup.string().required("Required"),
            })}
          >
            {(props) => {
              const {
                values,
                touched,
                errors,
                dirty,
                isSubmitting,
                handleChange,
                handleBlur,
                handleSubmit,
                handleReset,
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
                        onChange={(event): void =>
                          changeProject(event?.target.value)
                        }
                      ></Select>
                    </div>
                  </div>
                  <div className={classes.list}>
                    Group:{" "}
                    <div style={{ paddingLeft: 10 }}>
                      {groups
                        .filter((group) => user?.groupIds.includes(group.id))
                        .map((group) => {
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
                      Do you need to use the Live Room?
                    </FormLabel>
                    <RadioGroup
                      aria-label="liveroom"
                      name="liveroom"
                      value={liveToggle}
                      onChange={liveRoomChange}
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
                      Do you have guests?
                    </FormLabel>
                    <RadioGroup
                      aria-label="guestsToggle"
                      name="guestsToggle"
                      value={guestToggle}
                      onChange={showGuests}
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
                      Do you have any notes about your reservation for the Tech
                      Staff?
                    </FormLabel>
                    <RadioGroup
                      aria-label="notes"
                      name="notes"
                      value={notesToggle}
                      onChange={showNotes}
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
                    type="submit"
                    size="small"
                    variant="contained"
                    disableElevation
                    style={{ backgroundColor: "Green", color: "white" }}
                  >
                    Confirm Reservation
                  </Button>

                  <DialogActions></DialogActions>
                </form>
              );
            }}
          </Formik>
        </DialogContent>
      </React.Fragment>
    </Dialog>
  );
};

export default ReservationPage;
