import React from "react";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ViewWeekIcon from "@material-ui/icons/ViewWeek";
import ViewDayIcon from "@material-ui/icons/ViewDay";
import ViewComfyIcon from "@material-ui/icons/ViewComfy";
import ViewAgendaIcon from "@material-ui/icons/ViewAgenda";

const options = ["Schedule View", "Day View", "Week View", "Month View"];

const ITEM_HEIGHT = 48;

export default function ViewMenu(): JSX.Element {
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
            width: "20ch"
          }
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            selected={option === "Day View"}
            onClick={handleClose}
          >
            {((): JSX.Element => {
              switch (option) {
                case "Day View":
                  return <ViewDayIcon />;
                case "Week View":
                  return <ViewWeekIcon />;
                case "Schedule View":
                  return <ViewAgendaIcon />;
                default:
                  return <ViewComfyIcon />;
              }
            })()}
            <MenuItem style={{ float: "right" }}>{option}</MenuItem>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
