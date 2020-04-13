import React, { FunctionComponent } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import MailIcon from "@material-ui/icons/Mail";
import DateRangeIcon from '@material-ui/icons/DateRange';
import AssessmentIcon from '@material-ui/icons/Assessment';
import GroupIcon from '@material-ui/icons/Group';
import NotificationsIcon from '@material-ui/icons/Notifications';
import HomeIcon from '@material-ui/icons/Home';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import { ReactComponent as RND } from './icons8-home.svg';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
  },
});

interface ITemporaryDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}
const TemporaryDrawer: FunctionComponent<ITemporaryDrawerProps> = ({
  open,
  onClose,
  onOpen,
}) => {
  const classes = useStyles();

  return (
    <SwipeableDrawer
      open={open}
      anchor="left"
      onClose={onClose}
      onOpen={onOpen}
    >
      <div className={clsx(classes.list)} role="presentation">
        <List>
          {["Calendar", "Projects", "Groups", "Notifications"].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>
              {(() => {
                switch (index) {
                  case 0:  return <DateRangeIcon />;
                  case 1:  return <AssessmentIcon />;
                  case 2:  return <GroupIcon />;
                  default: return <NotificationsIcon />;
                }
              })()}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {["Studio 1", "Studio 2", "Studio 3", "Studio 4", "Outside Events"].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>
              {(() => {
              switch (index) {
                  case 1:  return  <RND />
                  case 4:  return <ConfirmationNumberIcon />;
                  default: return <HomeIcon />;
                }
              })()}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </div>
    </SwipeableDrawer>
  );
};

export default TemporaryDrawer;
