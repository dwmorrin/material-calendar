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
import Progress from "./Progress";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import NativeSelect from "@material-ui/core/NativeSelect";

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
  const [state, setState] = React.useState<{
    age: string | number;
    name: string;
  }>({
    age: "",
    name: "hai"
  });
  const classes = useStyles();
  const pageContents = [
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

  const handleChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = event.target.name as keyof typeof state;
    setState({
      ...state,
      [name]: event.target.value
    });
  };

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
          pageContents={pageContents}
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
              <Typography component="h6">{pageContents[0].title}</Typography>
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
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    Total Project Hours
                    <Progress />{" "}
                  </Grid>
                  <Grid item xs={12}>
                    Studio Allotment
                  </Grid>
                  <Grid item xs={5}>
                    <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="age-native-simple">
                        Studio 1
                      </InputLabel>
                      <Select
                        native
                        value={state.age}
                        onChange={handleChange}
                        inputProps={{
                          name: "Studio 1",
                          id: "age-native-simple"
                        }}
                      >
                        <option aria-label="None" value="" />
                        <option value={10}>Studio 1</option>
                        <option value={20}>Studio 2</option>
                        <option value={30}>Studio 3</option>
                        <option value={30}>Studio 4</option>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={7}>
                    <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="age-native-simple">
                        March 14 - March 22
                      </InputLabel>
                      <Select
                        native
                        value={state.age}
                        onChange={handleChange}
                        inputProps={{
                          name: "March 14 - March 22",
                          id: "age-native-simple"
                        }}
                      >
                        <option aria-label="None" value="" />
                        <option value={10}>March 14 - March 22</option>
                        <option value={20}>March 22 - March 29</option>
                        <option value={30}>March 29 - April 5</option>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Progress />{" "}
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
                  <Progress />
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
