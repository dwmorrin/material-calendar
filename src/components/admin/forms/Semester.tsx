import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormValues } from "../../../admin/types";
import { List } from "@material-ui/core";

const FormTemplate: FunctionComponent<FormValues> = () => (
  <List>
    <Field fullWidth component={TextField} name="title" label="Title" />
    <Field fullWidth component={TextField} name="start" label="Start" />
    <Field fullWidth component={TextField} name="end" label="End" />
    {/* TODO active is boolean */}
    <Field fullWidth component={TextField} name="active" label="Active" />
  </List>
);
export default FormTemplate;
