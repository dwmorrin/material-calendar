import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormValues } from "../../../admin/types";
import { List } from "@material-ui/core";

const FormTemplate: FunctionComponent<FormValues> = () => (
  <List>
    <Field fullWidth component={TextField} name="title" label="Title" />
    <Field
      fullWidth
      component={TextField}
      name="instructor"
      label="Instructor"
    />
  </List>
);

export default FormTemplate;
