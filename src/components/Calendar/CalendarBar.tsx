import React, { FunctionComponent } from "react";
import {
  CalendarAction,
  CalendarUIProps,
  CalendarUISelectionProps,
} from "../types";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Button,
  makeStyles,
  Badge,
} from "@material-ui/core";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import MenuIcon from "@material-ui/icons/Menu";
import TodayIcon from "@material-ui/icons/Today";
import ViewMenu from "../ViewMenu";
import MoreMenu from "../MoreMenu";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import UserGroup from "../../resources/UserGroup";
import { ResourceKey } from "../../resources/types";

const useStyles = makeStyles(() => ({
  title: {
    flexGrow: 1,
    color: "white",
  },
  toolbar: {
    paddingRight: 0,
  },
}));

const dateFormat = (sqlDate: string): string => {
  // ignore year, long month, day without pad
  const [, month, day] = sqlDate.split("-");
  return `${
    [
      "",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][Number(month)]
  } ${Number(day)}`;
};

const CalendarBar: FunctionComponent<
  CalendarUIProps & CalendarUISelectionProps
> = ({ dispatch, state, selections, setSelections }) => {
  const classes = useStyles();
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const invitations = groups.filter(({ pending }) => pending);
  return (
    <AppBar>
      <Toolbar className={classes.toolbar}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={(): void => dispatch({ type: CalendarAction.ToggleDrawer })}
        >
          <Badge color="secondary" badgeContent={invitations.length}>
            <MenuIcon />
          </Badge>
        </IconButton>
        <IconButton
          color="inherit"
          onClick={(): void => {
            dispatch({ type: CalendarAction.NavigateBefore });
          }}
        >
          <NavigateBeforeIcon />
        </IconButton>
        <Button
          endIcon={<ExpandMoreIcon />}
          className={classes.title}
          onClick={(): void => {
            dispatch({ type: CalendarAction.TogglePicker });
          }}
        >
          <Typography component="h6">
            {dateFormat(state.currentStart)}
          </Typography>
        </Button>
        <IconButton
          color="inherit"
          onClick={(): void => {
            dispatch({ type: CalendarAction.NavigateNext });
          }}
        >
          <NavigateNextIcon />
        </IconButton>

        <IconButton
          color="inherit"
          onClick={(): void => {
            dispatch({ type: CalendarAction.ViewToday });
          }}
        >
          <TodayIcon />
        </IconButton>
        <ViewMenu
          dispatch={dispatch}
          state={state}
          selections={selections}
          setSelections={setSelections}
        />
        <MoreMenu />
      </Toolbar>
    </AppBar>
  );
};

export default CalendarBar;
