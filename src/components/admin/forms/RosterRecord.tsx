import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { List } from "@material-ui/core";

const FormTemplate: FunctionComponent<FormTemplateProps> = () => (
  <List>
    <Field fullWidth component={TextField} name="course.id" label="Course ID" />
    <Field
      fullWidth
      component={TextField}
      name="student.id"
      label="Student NetID"
    />
  </List>
);
export default FormTemplate;
