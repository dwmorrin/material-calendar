import React, { FunctionComponent } from "react";
import { Dialog, Toolbar, IconButton, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { Formik } from "formik";
import { AdminAction, AdminUIProps } from "../../admin/types";
import { ResourceKey } from "../../resources/types";
import ResourceForm from "./forms/ResourceForm";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnUtils from "@date-io/date-fns";
import formRouter from "./forms/router";
import { dispatchOneResource } from "../../admin/dispatch";

const DetailsForm: FunctionComponent<AdminUIProps> = ({ dispatch, state }) => {
  if (!state.resourceInstance || !state.detailIsOpen) return null;

  const { template, valuator, updater } = formRouter(state.resourceKey);

  return (
    <Dialog open={state.detailIsOpen}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void => dispatch({ type: AdminAction.CloseDetail })}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5">{`Edit ${
          ResourceKey[state.resourceKey]
        }`}</Typography>
      </Toolbar>
      <MuiPickersUtilsProvider utils={DateFnUtils}>
        <Formik
          initialValues={valuator(state)}
          onSubmit={dispatchOneResource(dispatch, state, updater)}
        >
          {(props): JSX.Element => (
            <>
              <ResourceForm {...props} FormFields={template} state={state} />
            </>
          )}
        </Formik>
      </MuiPickersUtilsProvider>
    </Dialog>
  );
};

export default DetailsForm;
