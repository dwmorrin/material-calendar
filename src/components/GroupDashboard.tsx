import React, { FunctionComponent } from "react";
import {
  Dialog,
  Toolbar,
  IconButton,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ExpansionPanel,
  ExpansionPanelSummary,
  Box,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { makeTransition } from "./Transition";
import { getFormattedEventInterval } from "../calendar/date";

const transition = makeTransition("right");

const GroupDashboard: FunctionComponent<CalendarUIProps> = ({
  state,
  dispatch,
}) => {
  const { currentGroup, currentProject, currentProjectGroups } = state;
  return (
    <Dialog
      fullScreen
      TransitionComponent={transition}
      open={state.groupDashboardIsOpen}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseGroupDashboard })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography>{currentProject?.title}</Typography>
      </Toolbar>
      <Paper
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <section>
          <Typography variant="body2">
            {currentProject &&
              getFormattedEventInterval(
                currentProject?.start as string | Date,
                currentProject?.end as string | Date
              )}
          </Typography>
        </section>
        <Typography variant="body1" style={{ marginLeft: 20, marginTop: 20 }}>
          My Group
        </Typography>
        <Box
          style={{
            padding: "8px 16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {currentGroup?.title}
          <Button
            size="small"
            variant="contained"
            color="inherit"
            onClick={(): void =>
              console.error("you didn't implement 'leave group'")
            }
          >
            Leave
          </Button>
        </Box>
        <List>
          <ExpansionPanel defaultExpanded>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body1">Other groups</Typography>
            </ExpansionPanelSummary>
            {currentProjectGroups
              ?.filter((group) => group.id !== currentGroup?.id)
              .map((group) => (
                <ListItem
                  key={`projectGroup${group.id}`}
                  style={{ justifyContent: "space-between" }}
                >
                  {group.title}
                  <Button
                    size="small"
                    variant="contained"
                    color="inherit"
                    onClick={(): void =>
                      console.error("you didn't implement 'join group'")
                    }
                  >
                    Join
                  </Button>
                </ListItem>
              ))}
          </ExpansionPanel>
        </List>
      </Paper>
    </Dialog>
  );
};

export default GroupDashboard;
