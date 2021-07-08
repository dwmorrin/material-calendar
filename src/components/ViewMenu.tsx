import React, { FunctionComponent } from "react";
import {
  Typography,
  Button,
  Menu,
  MenuItem,
  Hidden,
  IconButton,
} from "@material-ui/core";
import ViewWeekIcon from "@material-ui/icons/ViewWeek";
import ViewDayIcon from "@material-ui/icons/ViewDay";
import ViewComfyIcon from "@material-ui/icons/ViewComfy";
import ViewAgendaIcon from "@material-ui/icons/ViewAgenda";
import {
  CalendarUIProps,
  CalendarUISelectionProps,
  CalendarView,
} from "../calendar/types";

const options = [
  {
    label: "Schedule",
    view: "listWeek" as CalendarView,
    icon: <ViewAgendaIcon />,
  },
  {
    label: "Day View",
    view: "resourceTimeGridDay" as CalendarView,
    icon: <ViewDayIcon />,
  },
  {
    label: "Week View",
    view: "resourceTimeGridWeek" as CalendarView,
    icon: <ViewWeekIcon />,
  },
  {
    label: "Month View",
    view: "dayGridMonth" as CalendarView,
    icon: <ViewComfyIcon />,
  },
];

const ViewMenu: FunctionComponent<CalendarUIProps & CalendarUISelectionProps> =
  ({ state, selections, setSelections }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = (): void => {
      setAnchorEl(null);
    };

    const currentOption = options.find(
      (option) => option.view === selections.calendarView
    );

    return (
      <div>
        <Hidden smUp>
          <IconButton
            aria-label="more"
            aria-controls="view-menu"
            aria-haspopup="true"
            onClick={handleClick}
            color="inherit"
          >
            {currentOption?.icon}
          </IconButton>
        </Hidden>
        <Hidden xsDown>
          <Button
            aria-label="more"
            aria-controls="view-menu"
            aria-haspopup="true"
            onClick={handleClick}
            startIcon={currentOption?.icon}
            color="inherit"
          >
            <Typography variant="body2"> {currentOption?.label} </Typography>
          </Button>
        </Hidden>
        <Menu
          id="view-menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
        >
          {options.map(({ label, view, icon }) => (
            <MenuItem
              key={label}
              onClick={(): void => {
                handleClose();
                setSelections({ ...selections, calendarView: view });
                state.ref?.current?.getApi().changeView(view);
              }}
            >
              {icon}
              <Typography variant="body2">{label}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  };
export default ViewMenu;
