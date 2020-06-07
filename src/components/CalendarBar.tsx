import React, { FunctionComponent } from "react";
import { CalendarAction, CalendarUIProps } from "../calendar/types";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Button,
  makeStyles,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import TodayIcon from "@material-ui/icons/Today";
import ViewMenu from "./ViewMenu";
import MoreMenu from "./MoreMenu";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const useStyles = makeStyles(() => ({
  title: {
    flexGrow: 1,
    color: "white",
  },
  toolbar: {
    paddingRight: 0,
  },
}));

const CalendarBar: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
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
              day: "numeric",
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
        <MoreMenu />
      </Toolbar>
    </AppBar>
  );
};

export default CalendarBar;
