import React, { FunctionComponent } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DateRangeIcon from "@material-ui/icons/DateRange";
import AssessmentIcon from "@material-ui/icons/Assessment";
import GroupIcon from "@material-ui/icons/Group";
import NotificationsIcon from "@material-ui/icons/Notifications";
import StudioPanel from "./StudioPanel";

const useStyles = makeStyles({
  list: {
    width: 250
  },
  fullList: {
    width: "auto"
  }
});

interface TemporaryDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  pageContents: { id: string; parentId: string; title: string }[];
  panelType: "checkboxes" | "buttons";
}
const TemporaryDrawer: FunctionComponent<TemporaryDrawerProps> = ({
  open,
  onClose,
  onOpen,
  panelType,
  pageContents
}) => {
  const classes = useStyles();
  return (
    <SwipeableDrawer
      open={open}
      anchor="left"
      onClose={onClose}
      onOpen={onOpen}
      onClick={(event): void => event.stopPropagation()}
    >
      <div className={clsx(classes.list)} role="presentation">
        <List>
          {["Calendar", "Projects", "Groups", "Notifications"].map(
            (text, index) => (
              <ListItem button key={text}>
                <ListItemIcon>
                  {((): JSX.Element => {
                    switch (index) {
                      case 0:
                        return <DateRangeIcon />;
                      case 1:
                        return <AssessmentIcon />;
                      case 2:
                        return <GroupIcon />;
                      default:
                        return <NotificationsIcon />;
                    }
                  })()}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            )
          )}
        </List>
        <Divider />
        <List>
          <StudioPanel pageContents={pageContents} panelType={panelType} />
        </List>
      </div>
    </SwipeableDrawer>
  );
};

export default TemporaryDrawer;
