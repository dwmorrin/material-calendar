import React, { FunctionComponent } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DateRangeIcon from '@material-ui/icons/DateRange';
import AssessmentIcon from '@material-ui/icons/Assessment';
import GroupIcon from '@material-ui/icons/Group';
import NotificationsIcon from '@material-ui/icons/Notifications';
import HomeIcon from '@material-ui/icons/Home';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import AssignmentIcon from '@material-ui/icons/Assignment';


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
  pageContents: string [];
}
const TemporaryDrawer: FunctionComponent<ITemporaryDrawerProps> = ({
  open,
  onClose,
  onOpen,
  pageContents,
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
          {pageContents.map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>
              {(() => {
              switch (text) {
                  case "Studio 1":  return <HomeIcon />;
                  case "Studio 2":  return <HomeIcon />;
                  case "Studio 3":  return <HomeIcon />;
                  case "Studio 4":  return <HomeIcon />;
                  case "Outside Events":  return <ConfirmationNumberIcon />;
                  default: return <AssignmentIcon />;
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
