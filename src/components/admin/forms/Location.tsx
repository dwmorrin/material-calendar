import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormValues } from "../../../admin/types";
import { List } from "@material-ui/core";

const FormTemplate: FunctionComponent<FormValues> = () => {
  return (
    <List>
      <Field fullWidth component={TextField} name="title" label="Title" />
      <Field fullWidth component={TextField} name="groupId" label="Group" />
      <Field
        fullWidth
        component={TextField}
        name="eventColor"
        label="Event Color"
      />
    </List>
  );
};

export default FormTemplate;
