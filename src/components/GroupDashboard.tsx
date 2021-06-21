import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
} from "react";
import {
  Dialog,
  Toolbar,
  IconButton,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  Box,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { makeTransition } from "./Transition";
import { getFormattedEventInterval } from "../utils/date";
import UserGroup from "../resources/UserGroup";
import { AuthContext } from "./AuthContext";

const transition = makeTransition("right");

const GroupDashboard: FunctionComponent<CalendarUIProps> = ({
  state,
  dispatch,
}) => {
  const { currentGroup, currentProject } = state;
  const [groups, setGroups] = useState([] as UserGroup[]);
  useEffect(() => {
    if (!currentProject?.id) return;
    fetch(`/api/projects/${currentProject.id}/groups`)
      .then((response) => response.json())
      .then(({ error, data, context }) => {
        if (error || !data) {
          return dispatch({
            type: CalendarAction.Error,
            payload: { error },
            meta: context,
          });
        }
        setGroups(
          data.map((group: UserGroup) => new UserGroup(group)) as UserGroup[]
        );
      });
  }, [currentProject, dispatch, state.currentGroup]);
  const { user } = useContext(AuthContext);
  if (!user) return null;
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
                currentProject?.start,
                currentProject?.end
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
          {currentGroup?.id && (
            <Button
              size="small"
              variant="contained"
              color="inherit"
              onClick={(event): void => {
                event.stopPropagation();
                fetch(`/api/users/${user.id}/groups/${currentGroup.id}`, {
                  method: "DELETE",
                  headers: {},
                  body: null,
                })
                  .then((response) => response.json())
                  .then(({ error, data, context }) => {
                    if (error || !data) {
                      return dispatch({
                        type: CalendarAction.Error,
                        payload: { error },
                        meta: context,
                      });
                    } else {
                      dispatch({ type: CalendarAction.LeftGroup });
                    }
                  });
              }}
            >
              Leave
            </Button>
          )}
        </Box>
        <List>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body1">Other groups</Typography>
            </AccordionSummary>
            {groups
              ?.filter((group) => group.id !== currentGroup?.id)
              .map((group) => (
                <ListItem
                  key={`course${group.id}`}
                  style={{ justifyContent: "space-between" }}
                >
                  {group.title}
                  {currentGroup?.id && (
                    <Button
                      size="small"
                      variant="contained"
                      color="inherit"
                      onClick={(event): void => {
                        event.stopPropagation();
                        currentGroup?.id
                          ? fetch(
                              `/api/users/${user.id}/groups/${currentGroup.id}`,
                              {
                                method: "DELETE",
                                headers: {},
                                body: null,
                              }
                            )
                              .then((response) => response.json())
                              .then(({ error, data, context }) => {
                                if (error || !data) {
                                  return dispatch({
                                    type: CalendarAction.Error,
                                    payload: { error },
                                    meta: context,
                                  });
                                } else {
                                  fetch(
                                    `/api/users/${user.id}/groups/${group.id}`,
                                    {
                                      method: "POST",
                                    }
                                  )
                                    .then((response) => response.json())
                                    .then(({ error, data, context }) => {
                                      if (error || !data) {
                                        return dispatch({
                                          type: CalendarAction.Error,
                                          payload: { error },
                                          meta: context,
                                        });
                                      } else {
                                        fetch(`/api/users/groups/${group.id}`)
                                          .then((response) => response.json())
                                          .then(({ error, data, context }) => {
                                            if (error || !data) {
                                              return dispatch({
                                                type: CalendarAction.Error,
                                                payload: { error },
                                                meta: context,
                                              });
                                            } else {
                                              dispatch({
                                                type: CalendarAction.JoinedGroup,
                                                payload: {
                                                  currentGroup: new UserGroup(
                                                    data[0]
                                                  ),
                                                },
                                              });
                                            }
                                          });
                                      }
                                    });
                                }
                              })
                          : fetch(`/api/users/${user.id}/groups/${group.id}`, {
                              method: "POST",
                            })
                              .then((response) => response.json())
                              .then(({ error, data, context }) => {
                                if (error || !data) {
                                  return dispatch({
                                    type: CalendarAction.Error,
                                    payload: { error },
                                    meta: context,
                                  });
                                } else {
                                  dispatch({
                                    type: CalendarAction.JoinedGroup,
                                    payload: { currentGroup: group },
                                  });
                                }
                              });
                      }}
                    >
                      Join
                    </Button>
                  )}
                </ListItem>
              ))}
          </Accordion>
        </List>
      </Paper>
    </Dialog>
  );
};

export default GroupDashboard;
