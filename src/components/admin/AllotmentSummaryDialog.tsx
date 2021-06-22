import React, { FC } from "react";
import { Dialog, DialogTitle, DialogContent, Button } from "@material-ui/core";
import DraggablePaper from "../../components/DraggablePaper";
import { AdminUIProps, AdminAction } from "../../admin/types";
import { ResourceKey } from "../../resources/types";

const AllotmentSummaryDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  if (!state.calendarEventClickState) return null;

  const projectId = Number(
    state.calendarEventClickState.extendedProps.projectId
  );

  if (projectId < 0) return null;

  const close = (): void =>
    dispatch({ type: AdminAction.CloseAllotmentSummaryDialog });

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
      open={state.allotmentSummaryDialogIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-tite"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        {state.calendarEventClickState.title}
      </DialogTitle>
      <DialogContent>
        <Button onClick={(): void => openProject()}>Open project</Button>
      </DialogContent>
    </Dialog>
  );
};

export default AllotmentSummaryDialog;
