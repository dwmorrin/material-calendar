import React, { FC } from "react";
import { Dialog, DialogTitle, DialogContent, Button } from "@material-ui/core";
import DraggablePaper from "../DraggablePaper";
import { AdminUIProps, AdminAction } from "../../admin/types";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";

const ProjectLocationHoursSummaryDialog: FC<AdminUIProps> = ({
  dispatch,
  state,
}) => {
  if (!state.calendarEventClickState) return null;

  const projectId = Number(
    state.calendarEventClickState.extendedProps.projectId
  );
  if (projectId < 0 || !state.schedulerLocationId) return null;

  const project = (state.resources[ResourceKey.Projects] as Project[]).find(
    ({ id }) => id === projectId
  );
  if (!project) return null;

  const locationHours = project.locationHours.find(
    ({ locationId }) => locationId === state.schedulerLocationId
  );
  if (!locationHours) return null;

  const allottedHours = project.allotments.reduce(
    (sum, { hours }) => sum + hours,
    0
  );

  const title = `${project.title} - Allotted: ${allottedHours} - Max: ${locationHours.hours}`;

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
        {title}
      </DialogTitle>
      <DialogContent>
        <Button onClick={(): void => openProject()}>Open project</Button>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectLocationHoursSummaryDialog;
