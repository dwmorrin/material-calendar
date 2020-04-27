import React, { FunctionComponent, useContext } from "react";
import { CalendarAction, CalendarUIProps } from "../calendar/types";
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
import { AuthContext } from "./AuthContext";
import { navigate } from "@reach/router";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRIght: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "white",
  },
}));

const CalendarBar: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { user, setUser } = useContext(AuthContext);
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
          <IconButton
            onClick={(): void => {
              if (!user || !setUser) {
                throw new Error("no method to logout user");
              }
              fetch("/api/logout");
              user.id = "";
              sessionStorage.clear();
              setUser(user);
              navigate("/");
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </List>
    </AppBar>
  );
};

export default CalendarBar;
