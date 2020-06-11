import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { DatePicker } from "formik-material-ui-pickers";
import { FormValues, ValueDictionary } from "../../../admin/types";
import { List } from "@material-ui/core";
import CheckboxList from "./CheckboxList";
import FieldList from "./FieldList";

// TODO need a radio for the group, not checkbox
const FormTemplate: FunctionComponent<FormValues> = ({
  managers,
  members,
  groups,
}) => (
  <List>
    <Field fullWidth component={TextField} name="title" label="Title" />
    <Field
      fullWidth
      component={TextField}
      name="description"
      label="Description"
    />
    <Field fullWidth component={DatePicker} name="start" label="Start" />
    <Field fullWidth component={DatePicker} name="end" label="End" />
    <FieldList name="managers" values={managers as string[]} />
    <FieldList name="members" values={members as string[]} />
    <CheckboxList name="groups" values={groups as ValueDictionary} />
  </List>
);
export default FormTemplate;
