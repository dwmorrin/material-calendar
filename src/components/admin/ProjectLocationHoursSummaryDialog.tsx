import React, { FC } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableRow,
} from "@material-ui/core";
import DraggablePaper from "../DraggablePaper";
import { AdminUIProps, AdminAction, AdminSelectionProps } from "./types";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";
import { formatSlashed, parseSQLDate } from "../../utils/date";
import { getProjectInfo } from "./Scheduler/lib";
import RosterRecord from "../../resources/RosterRecord";

const ProjectLocationHoursSummaryDialog: FC<
  AdminUIProps & AdminSelectionProps
> = ({ dispatch, state, selections }) => {
  if (!state.calendarEventClickState || selections.locationId < 1) return null;

  const projectId = Number(
    state.calendarEventClickState.extendedProps.projectId
  );
  if (projectId < 0) return null;

  const title = state.calendarEventClickState.title || "?";

  const projects = state.resources[ResourceKey.Projects] as Project[];
  const rosterRecords = state.resources[
    ResourceKey.RosterRecords
  ] as RosterRecord[];

  const project = projects.find(({ id }) => id === projectId);
  if (!project) return null;

  const projectInfo = getProjectInfo(projects, rosterRecords)[projectId];

  const locationHours = project.locationHours.find(
    ({ locationId }) => locationId === selections.locationId
  );
  if (!locationHours) return null;

  const allottedHours = project.allotments.reduce(
    (sum, { hours }) => sum + hours,
    0
  );

  const close = (): void =>
    dispatch({ type: AdminAction.CloseProjectLocationHoursSummaryDialog });

  const openProject = (): void =>
    dispatch({
      type: AdminAction.OpenDetailWithResourceInstance,
      payload: {
        resourceKey: ResourceKey.Projects,
        resourceInstance: state.resources[ResourceKey.Projects].find(
          ({ id }) => id === projectId
        ),
      },
    });

  return (
    <Dialog
      open={state.projectLocationHoursSummaryDialogIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        {project.title}
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableRow>
              <TableCell>Info</TableCell>
              <TableCell>{title}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Reservations start</TableCell>
              <TableCell>
                {formatSlashed(parseSQLDate(project.reservationStart))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Alloted hours</TableCell>
              <TableCell>{allottedHours}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Maximum hours</TableCell>
              <TableCell>{locationHours.hours}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Group hours</TableCell>
              <TableCell>{project.groupAllottedHours}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Students</TableCell>
              <TableCell>{projectInfo.students}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Group size</TableCell>
              <TableCell>{project.groupSize}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Group hours neded</TableCell>
              <TableCell>{projectInfo.groupHoursEstimate}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Group number estimate</TableCell>
              <TableCell>{projectInfo.groupNumberEstimate}</TableCell>
            </TableRow>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={(): void => openProject()}>Open project</Button>
        <Button onClick={close}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectLocationHoursSummaryDialog;
