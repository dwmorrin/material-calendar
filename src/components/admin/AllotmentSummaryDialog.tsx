import React, { FC } from "react";
import { Dialog, DialogTitle, DialogContent } from "@material-ui/core";
import DraggablePaper from "../../components/DraggablePaper";
import { AdminUIProps, AdminAction } from "../../admin/types";

const AllotmentSummaryDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  if (!state.calendarEventClickState) return null;

  const projectId = Number(
    state.calendarEventClickState.extendedProps.projectId
  );

  if (projectId < 0) return null;

  const close = (): void =>
    dispatch({ type: AdminAction.CloseAllotmentSummaryDialog });

  return (
    <Dialog
      open={state.allotmentSummaryIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-tite"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        {state.calendarEventClickState.title}
      </DialogTitle>
      <DialogContent></DialogContent>
    </Dialog>
  );
};

export default AllotmentSummaryDialog;
