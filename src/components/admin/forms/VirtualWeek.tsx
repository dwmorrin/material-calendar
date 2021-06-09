import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { List } from "@material-ui/core";

const FormTemplate: FunctionComponent<FormTemplateProps> = () => (
  <List>
    <Field fullWidth component={TextField} name="start" label="Start" />
    <Field fullWidth component={TextField} name="end" label="End" />
    <Field
      fullWidth
      component={TextField}
      name="locationId"
      label="Location ID"
    />
    <Field
      fullWidth
      component={TextField}
      name="locationHours"
      label="Location hours"
    />
    <Field
      fullWidth
      component={TextField}
      name="projectHours"
      label="Project hours"
    />
  </List>
);
export default FormTemplate;
