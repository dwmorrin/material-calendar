import React, { FunctionComponent, useContext } from "react";
import { CalendarAction, CalendarUIProps } from "../calendar/types";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Button,
  makeStyles,
  Badge,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import TodayIcon from "@material-ui/icons/Today";
import ViewMenu from "./ViewMenu";
import MoreMenu from "./MoreMenu";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { AuthContext } from "./AuthContext";

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
  const { user } = useContext(AuthContext);
  const classes = useStyles();
  const unansweredInvitations =
    state.invitations?.filter(function (invitation) {
      // Get Invitations where user has yet to respond
      const u = invitation.invitees.find((invitee) => invitee.id === user.id);
      if (u?.accepted == 0 && u.rejected === 0) return true;
      else return false;
    }) || [];
  return (
    <AppBar>
      <Toolbar className={classes.toolbar}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={(): void => dispatch({ type: CalendarAction.ToggleDrawer })}
        >
          <Badge
            color="secondary"
            badgeContent={
              unansweredInvitations.filter(
                (invitation) => invitation.invitor.id !== user?.id
              ).length
            }
          >
            <MenuIcon />
          </Badge>
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
