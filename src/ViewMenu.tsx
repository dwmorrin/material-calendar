import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ViewWeekIcon from '@material-ui/icons/ViewWeek';
import ViewDayIcon from '@material-ui/icons/ViewDay';
import ViewComfyIcon from '@material-ui/icons/ViewComfy';

const options = [
  'Day',
  'Week',
  'Month'
];

const ITEM_HEIGHT = 48;


export default function ViewMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        aria-controls="view-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
       <ViewDayIcon/>

      </IconButton>
      <Menu
        id="view-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: '20ch',
          },
        }}
      >

        {options.map((option) => (
          <MenuItem key={option} selected={option === 'Day'} onClick={handleClose}>
            {(() => {
                switch (option) {
                  case "Day":  return <ViewDayIcon />;
                  case "Week":  return <ViewWeekIcon />;
                  default: return <ViewComfyIcon />;
                }
              })()}
              <MenuItem style={{float: 'right'}}>
              {option} 
              </MenuItem>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
