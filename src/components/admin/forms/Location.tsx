import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { List } from "@material-ui/core";

const FormTemplate: FunctionComponent<FormTemplateProps> = () => {
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
