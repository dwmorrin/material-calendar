import React, { FunctionComponent } from "react";
import {
  Accordion,
  AccordionSummary,
  Dialog,
  IconButton,
  Toolbar,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import GroupSizeList from "./GroupSizeList";
import RefundList from "./RefundList";
import { AdminAction, AdminUIProps } from "../../../admin/types";
import Reservation from "../../../resources/Reservation";
import UserGroup from "../../../resources/UserGroup";

const ExceptionsDashboard: FunctionComponent<
  AdminUIProps & {
    exceptions: { groupSize: UserGroup[]; refunds: Reservation[] };
  }
> = ({ dispatch, state, exceptions: { groupSize, refunds } }) => {
  return (
    <Dialog fullScreen={true} open={state.exceptionsDashboardIsOpen}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: AdminAction.CloseExceptionsDashboard })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5">Exceptions Dashboard</Typography>
      </Toolbar>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Group size</Typography>
        </AccordionSummary>
        {groupSize.length ? (
          <GroupSizeList dispatch={dispatch} state={state} groups={groupSize} />
        ) : (
          "no pending requests"
        )}
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Cancelation Refund Requests</Typography>
        </AccordionSummary>
        {refunds.length ? (
          <RefundList
            reservations={refunds}
            dispatch={dispatch}
            state={state}
          />
        ) : (
          "no pending requests"
        )}
      </Accordion>
    </Dialog>
  );
};

export default ExceptionsDashboard;
