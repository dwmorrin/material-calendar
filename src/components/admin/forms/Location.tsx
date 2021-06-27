import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { List } from "@material-ui/core";

const FormTemplate: FunctionComponent<FormTemplateProps> = () => (
  <List>
    <Field fullWidth component={TextField} name="title" label="Title" />
    <Field fullWidth component={TextField} name="groupId" label="Group" />
    <Field
      fullWidth
      component={TextField}
      name="restriction"
      label="Restriction"
    />
  </List>
);

export default FormTemplate;
