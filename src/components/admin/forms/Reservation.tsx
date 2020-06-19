import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormValues } from "../../../admin/types";
import { List } from "@material-ui/core";
import FieldList from "./FieldList";

// TODO finish implementing all reservation properties
const FormTemplate: FunctionComponent<FormValues> = ({ owners, guests }) => (
  <List>
    <Field
      fullWidth
      component={TextField}
      name="description"
      label="Description"
    />
    <Field fullWidth component={TextField} name="event" label="Event ID" />
    <Field fullWidth component={TextField} name="project" label="Project ID" />
    <FieldList name="owners" values={owners as string[]} />
    <FieldList name="guests" values={guests as string[]} />
    <div>
      Still need to incorporate notes, cancellation, status, and expires...
    </div>
  </List>
);
export default FormTemplate;
