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
  Button,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Select from "./Select";
import { AuthContext } from "./AuthContext";
import { makeTransition } from "./Transition";
import UserGroup from "../user/UserGroup";

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
  gear: {
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
  const [gearToggle, setGearValue] = React.useState("no");
  const [tapeToggle, setTapeValue] = React.useState("no");

  const changeProject = (id: number): void => {
    const proj = state.projects.filter(function (project) {
      // eslint-disable-next-line
      return project.id == id;
    });
    setCurrentProject(proj[0]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setLiveValue((event.target as HTMLInputElement).value);
  };

  const tapeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTapeValue((event.target as HTMLInputElement).value);
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

  const showGear = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setGearValue((event.target as HTMLInputElement).value);
    const val = (event.target as HTMLInputElement).value;
    const element = document.getElementById("gearInput");
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
        <Typography>Make Reservation</Typography>
      </Toolbar>
      <div>
        {" "}
        <div className={classes.list}>
          <div style={{ paddingTop: 18 }}>Project:</div>
          <div style={{ paddingLeft: 5 }}>
            <Select
              dispatch={dispatch}
              state={state}
              value={currentProject ? currentProject.id : ""}
              selectName="projects"
              selectId="projectsDropDown"
              contents={projects}
              onChange={(event): void => changeProject(event?.target.value)}
            ></Select>
          </div>
        </div>
        <div>
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
        </div>
        <br />
        <FormControl component="fieldset">
          <FormLabel component="legend">
            Do you need to use the Live Room?
          </FormLabel>
          <RadioGroup
            aria-label="liveroom"
            name="liveroom"
            value={liveToggle}
            onChange={handleChange}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
        <br />
        <FormControl component="fieldset">
          <FormLabel component="legend">
            Would you like to use the analog tape machine?
          </FormLabel>
          <RadioGroup
            aria-label="tape"
            name="tape"
            value={tapeToggle}
            onChange={tapeChange}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
        <br />
        <div>
          <TextField
            id="standard-basic"
            label="Brief Description of what you will be doing"
            style={{ minWidth: 320 }}
          />
        </div>
        <br />
        <FormControl component="fieldset">
          <FormLabel component="legend">Do you have guests?</FormLabel>
          <RadioGroup
            aria-label="guests"
            name="guests"
            value={guestToggle}
            onChange={showGuests}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
        <br />
        <div id="guestInput" className={classes.guests}>
          <TextField id="guestNames" label="Guest Names" />
          <br />
        </div>
        <TextField id="phoneNumber" label="Phone Number" />
        <br />
        <br />
        <FormControl component="fieldset">
          <FormLabel component="legend">
            Would you like to reserve any gear?
          </FormLabel>
          <RadioGroup
            aria-label="gear"
            name="gear"
            value={gearToggle}
            onChange={showGear}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
        <div id="gearInput" className={classes.gear}>
          <TextField
            id="gearList"
            label="What gear would you like to reserve?"
            style={{ minWidth: 300 }}
            multiline
            rows={8}
          />
        </div>
        <br />
        <Button
          size="small"
          variant="contained"
          disableElevation
          style={{ backgroundColor: "Green", color: "white" }}
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseReservationPage })
          }
        >
          Confirm Reservation
        </Button>
      </div>
    </Dialog>
  );
};

export default ReservationPage;
