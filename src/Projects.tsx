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
import Database from "./Database.js";

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
    textAlign: "center"
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

  const projects = Database.projects;
  const group = Database.group;
  const locations = Database.locations;
  const weeks = Database.weeks;

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
          drawerContents={projects}
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
              <Typography component="h6">{projects[0].title}</Typography>
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
                      contents={locations}
                    ></DropDown>
                  </Grid>
                  <Grid item xs={7}>
                    <DropDown
                      selectName="dates"
                      selectId="datesDropDown"
                      contents={weeks}
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
              <Paper className={classes.paper}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <b>My Group</b>
                  </Grid>
                  <Grid item xs={5}>
                    <p className={classes.text}>
                      {" "}
                      Group Members:
                      <br />
                      {group.length < 1 ? undefined : (
                        <Button
                          size="small"
                          variant="contained"
                          color="inherit"
                          disableElevation
                        >
                          Leave Group
                        </Button>
                      )}
                    </p>
                  </Grid>
                  <Grid item xs={7}>
                    <p className={classes.text}>
                      {group.map((user, key) => {
                        return (
                          <span key={key}>
                            {user.name}
                            <br />
                          </span>
                        );
                      })}
                      <Button
                        size="small"
                        variant="contained"
                        color="inherit"
                        disableElevation
                      >
                        Add User
                      </Button>
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
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </div>
  );
};

export default Projects;
