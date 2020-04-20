import React, { FunctionComponent, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  List,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { RouteComponentProps } from "@reach/router";
import TemporaryDrawer from "./TemporaryDrawer";
import ProgressBar from "./ProgressBar";
import DropDown from "./DropDown";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
    color: "white"
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  grid: {
    textAlign: "center"
  },
  text: {
    paddingLeft: "10px",
    textAlign: "left"
  }
}));

const Projects: FunctionComponent<RouteComponentProps> = () => {
  const pickerShowing = useState(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const classes = useStyles();
  const tempProjects = [
    {
      id: "Compression Project St3 Sp20",
      parentId: "Engineering the Record",
      title: "Compression Project St3 Sp20"
    },
    {
      id: "Sound-Alike Phase 1 St3 Sp20",
      parentId: "Engineering the Record",
      title: "Sound-Alike Phase 1 St3 Sp20"
    },
    {
      id: "Sound-Alike Phase 2 St3 Sp20",
      parentId: "Engineering the Record",
      title: "Sound-Alike Phase 2 St3 Sp20"
    },
    {
      id: "Sound-Alike Phase 3 St3 Sp20",
      parentId: "Engineering the Record",
      title: "Sound-Alike Phase 3 St3 Sp20"
    }
  ];
  const tempWeeks = [
    {
      id: "March 14 - March 22",
      title: "March 14 - March 22"
    },
    {
      id: "March 22 - March 29",
      title: "March 22 - March 29"
    },
    {
      id: "March 29 - April 5",
      title: "March 29 - April 5"
    }
  ];
  const tempLocations = [
    {
      id: "Studio 1",
      parentId: "Studios",
      title: "Studio 1"
    },
    {
      id: "Studio 2",
      parentId: "Studios",
      title: "Studio 2"
    },
    {
      id: "Studio 3",
      parentId: "Studios",
      title: "Studio 3"
    },
    {
      id: "Studio 4",
      parentId: "Studios",
      title: "Studio 4"
    },
    {
      id: "Edit Suite 1",
      parentId: "Edit Suites",
      title: "Edit Suite 1"
    },
    {
      id: "Edit Suite 2",
      parentId: "Edit Suites",
      title: "Edit Suite 2"
    },
    {
      id: "Edit Suite 3",
      parentId: "Edit Suites",
      title: "Edit Suite 3"
    },
    {
      id: "Edit Suite 4",
      parentId: "Edit Suites",
      title: "Edit Suite 4"
    },
    {
      id: "Edit Suite 5",
      parentId: "Edit Suites",
      title: "Edit Suite 5"
    },
    {
      id: "Production Suite A",
      parentId: "Studios",
      title: "Production Suite A"
    },
    {
      id: "Production Suite B",
      parentId: "Studios",
      title: "Production Suite B"
    },
    {
      id: "Rehearsal Room 1",
      parentId: "Rehearsal Rooms",
      title: "Rehearsal Room 1"
    },
    {
      id: "Rehearsal Room 2",
      parentId: "Rehearsal Rooms",
      title: "Rehearsal Room 2"
    }
  ];

  const toggleDrawer = () => (
    event: React.KeyboardEvent | React.MouseEvent
  ): void => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setDrawerIsOpen(!drawerIsOpen);
  };
  return (
    <div className={classes.root}>
      <div onClick={(): void => setDrawerIsOpen(!drawerIsOpen)}>
        <TemporaryDrawer
          open={drawerIsOpen}
          onOpen={toggleDrawer}
          onClose={toggleDrawer}
          drawerContents={tempProjects}
          panelType={"buttons"}
        />
      </div>
      <AppBar position="sticky">
        <List>
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer()}
            >
              <MenuIcon />
            </IconButton>
            <Button className={classes.title}>
              <Typography component="h6">{tempProjects[0].title}</Typography>
            </Button>
            <IconButton></IconButton>
          </Toolbar>
        </List>
      </AppBar>
      {pickerShowing && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    Studio Allotment
                  </Grid>
                  <Grid item xs={5}>
                    <DropDown
                      selectName="studios"
                      selectId="studiosDropDown"
                      contents={tempLocations}
                    ></DropDown>
                  </Grid>
                  <Grid item xs={7}>
                    <DropDown
                      selectName="dates"
                      selectId="datesDropDown"
                      contents={tempWeeks}
                    ></DropDown>
                  </Grid>
                  <Grid item xs={12}>
                    <ProgressBar
                      left={{ title: "", value: 9, color: "#fc0303" }}
                      right={{ title: "", value: 3, color: "#03fc1c" }}
                    />{" "}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} className={classes.grid}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <b>My Group</b>
                </Grid>
                <Grid item xs={5}>
                  <p className={classes.text}> Group Members:</p>
                </Grid>
                <Grid item xs={7}>
                  <p className={classes.text}>
                    John Lennon<br></br>Paul McCartney<br></br>George Harrison
                    <br></br>Ringo Starr
                  </p>
                </Grid>
                <Grid item xs={12}>
                  <p className={classes.text}>My Hours:</p>
                </Grid>
                <Grid item xs={12}>
                  <ProgressBar
                    left={{ title: "", value: 12, color: "#fc0303" }}
                    right={{ title: "", value: 3, color: "#03fc1c" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <p className={classes.text}>Upcoming Sessions:</p>
                </Grid>
                <Grid item xs={12}>
                  <p className={classes.text}>Previous Sessions:</p>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
    </div>
  );
};

export default Projects;
