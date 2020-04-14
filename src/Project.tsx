import React, { FunctionComponent, useEffect, useState, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  List,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import TodayIcon from "@material-ui/icons/Today";
import { RouteComponentProps } from "@reach/router";
import TemporaryDrawer from "./TemporaryDrawer";
import ViewMenu from "./ViewMenu";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "white",
  },
}));

const fakeEventDate = (offset: number) => {
  const date = new Date();
  date.setHours(date.getHours() + offset);
  return date;
};
const getCurrentTimeString = () => {
  const date = new Date();
  const timeString = date.toTimeString().split(" ")[0];
  return timeString;
};

const Calendar: FunctionComponent<RouteComponentProps> = () => {
  const [currentStart, setCurrentStart] = useState(new Date());
  const [pickerShowing, setPickerShowing] = useState(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const classes = useStyles();

  const toggleDrawer = () => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
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
      <div onClick={() => setDrawerIsOpen(!drawerIsOpen)}>
        <TemporaryDrawer
          open={drawerIsOpen}
          onOpen={toggleDrawer}
          onClose={toggleDrawer}
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
              <Typography component="h6">
              Compression Project St3 Sp20
              </Typography>
            </Button>
            <IconButton>
            </IconButton>
          </Toolbar>
        </List>
      </AppBar>
      {pickerShowing && (
        <Box>
        </Box>
      )}
    </div>
  );
};

export default Calendar;
