import React, { FunctionComponent } from "react";
import {
  Typography,
  Button,
  Menu,
  MenuItem,
  Hidden,
  IconButton
} from "@material-ui/core";
import ViewWeekIcon from "@material-ui/icons/ViewWeek";
import ViewDayIcon from "@material-ui/icons/ViewDay";
import ViewComfyIcon from "@material-ui/icons/ViewComfy";
import ViewAgendaIcon from "@material-ui/icons/ViewAgenda";
import { CalendarAction, CalendarUIProps } from "../calendar/types";

const options = [
  {
    label: "Schedule",
    view: "listWeek",
    icon: <ViewAgendaIcon />
  },
  {
    label: "Day View",
    view: "resourceTimeGridDay",
    icon: <ViewDayIcon />
  },
  {
    label: "Week View",
    view: "resourceTimeGridWeek",
    icon: <ViewWeekIcon />
  },
  {
    label: "Month View",
    view: "dayGridMonth",
    icon: <ViewComfyIcon />
  }
];

const ViewMenu: FunctionComponent<CalendarUIProps> = ({ dispatch, state }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const currentOption = options.find(
    (option) => option.view === state.currentView
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
              dispatch({
                type: CalendarAction.ChangedView,
                payload: { currentView: view }
              });
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
