import React, { FunctionComponent } from "react";
import { Action, CalendarAction, CalendarState } from "../calendar/types";
import {
  AppBar,
  List,
  IconButton,
  Toolbar,
  Typography,
  Button,
  makeStyles,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import TodayIcon from "@material-ui/icons/Today";
const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRIght: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "white",
  },
}));
type CalendarBarProps = {
  dispatch: (action: Action) => void;
  state: CalendarState;
};
const CalendarBar: FunctionComponent<CalendarBarProps> = ({
  dispatch,
  state,
}) => {
  const classes = useStyles();
  return (
    <AppBar position="sticky">
      <List>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={(): void =>
              dispatch({ type: CalendarAction.ToggleDrawer })
            }
          >
            <MenuIcon />
          </IconButton>
          <Button
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
            onClick={(): void => {
              dispatch({ type: CalendarAction.ViewToday });
            }}
          >
            <TodayIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </List>
    </AppBar>
  );
};

export default CalendarBar;