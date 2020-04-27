import React, { FunctionComponent } from "react";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ViewWeekIcon from "@material-ui/icons/ViewWeek";
import ViewDayIcon from "@material-ui/icons/ViewDay";
import ViewComfyIcon from "@material-ui/icons/ViewComfy";
import ViewAgendaIcon from "@material-ui/icons/ViewAgenda";
import {
  CalendarAction,
  CalendarView,
  CalendarUIProps,
} from "../calendar/types";

const options = [
  {
    label: "Schedule",
    view: "listWeek",
    icon: <ViewAgendaIcon />,
  },
  {
    label: "Day View",
    view: "resourceTimeGridDay",
    icon: <ViewDayIcon />,
  },
  {
    label: "Week View",
    view: "resourceTimeGridWeek",
    icon: <ViewWeekIcon />,
  },
  {
    label: "Month View",
    view: "dayGridMonth",
    icon: <ViewComfyIcon />,
  },
];

const ITEM_HEIGHT = 68;

const ViewMenu: FunctionComponent<CalendarUIProps> = ({ dispatch, state }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        aria-label="more"
        aria-controls="view-menu"
        aria-haspopup="true"
        onClick={handleClick}
        startIcon={<ViewDayIcon />}
        color="inherit"
      >
        Day View
      </Button>
      <Menu
        id="view-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: "20ch",
          },
        }}
      >
        {options.map(({label, view, icon}) => (
          <MenuItem
            key={label}
            onClick={(): void =>
              dispatch({
                type: CalendarAction.ChangedView,
                payload: { currentView: view as CalendarView },
              })
            }
          >
            {icon}
            <p style={{ paddingLeft: "15px" }}>{label}</p>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
export default ViewMenu;