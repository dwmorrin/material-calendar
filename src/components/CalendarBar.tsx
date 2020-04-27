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
import ViewMenu from "./ViewMenu";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
    color: "white",
  },
  centered: {
    marginLeft: "auto",
    marginRight: "auto",
  }
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
          <div className={classes.centered}>
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
              color="inherit"
              onClick={(): void => {
                dispatch({ type: CalendarAction.ViewToday });
              }}
            >
              <TodayIcon />
            </IconButton>
          </div>
          <ViewMenu dispatch={dispatch} state={state} />
          <IconButton
            color="inherit"
            onClick={(): void => {
              if (!user || !setUser) {
                throw new Error("no method to logout user");
              }
              user.id = "";
              sessionStorage.clear();
              setUser(user);
              navigate("/");
            }}
          >
            <MoreVertIcon color="inherit" />
          </IconButton>
        </Toolbar>
      </List>
    </AppBar>
  );
};

export default CalendarBar;