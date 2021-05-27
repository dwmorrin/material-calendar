import React, { FC } from "react";
import Draggable from "react-draggable";
import { Paper, PaperProps } from "@material-ui/core";

const DraggablePaper: FC = (props: PaperProps) => (
  <Draggable
    handle="#draggable-dialog-title"
    cancel={'[class*="MuiDialogContent-root"]'}
  >
    <Paper {...props} />
  </Draggable>
);

export default DraggablePaper;
