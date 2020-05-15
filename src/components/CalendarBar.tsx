import React, { FunctionComponent, useContext } from "react";
import { CalendarAction, CalendarUIProps } from "../calendar/types";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Button,
  makeStyles
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import TodayIcon from "@material-ui/icons/Today";
import { AuthContext } from "./AuthContext";
import { navigate } from "@reach/router";
import ViewMenu from "./ViewMenu";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const useStyles = makeStyles(() => ({
  title: {
    flexGrow: 1,
    color: "white"
  },
  toolbar: {
    paddingRight: 0
  }
}));

const CalendarBar: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state
}) => {
  const { user, setUser } = useContext(AuthContext);
  const classes = useStyles();
  return (
    <AppBar position="sticky">
      <Toolbar className={classes.toolbar}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={(): void => dispatch({ type: CalendarAction.ToggleDrawer })}
        >
          <MenuIcon />
        </IconButton>
        <Button
          endIcon={<ExpandMoreIcon />}
          className={classes.title}
          onClick={(): void => {
            dispatch({ type: CalendarAction.TogglePicker });
          }}
        >
          <Typography component="h6">
            {state.currentStart.toLocaleString("default", {
              month: "long",
              day: "numeric"
            })}
          </Typography>
        </Button>

        <IconButton
          color="inherit"
          onClick={(): void => {
            dispatch({ type: CalendarAction.ViewToday });
          }}
        >
          <TodayIcon />
        </IconButton>
        <ViewMenu dispatch={dispatch} state={state} />
        <IconButton
          color="inherit"
          onClick={(): void => {
            if (!user || !setUser) {
              throw new Error("no method to logout user");
            }
            fetch("/api/logout", {
              method: "POST",
              credentials: "include"
            });
            user.id = "";
            sessionStorage.clear();
            setUser(user);
            navigate("/");
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default CalendarBar;
