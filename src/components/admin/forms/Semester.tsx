import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, CheckboxWithLabel } from "formik-material-ui";
import { DatePicker } from "formik-material-ui-pickers";
import { FormTemplateProps } from "../../../admin/types";
import { List } from "@material-ui/core";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({values}) => {
  const { active } = values;
  return (
    <List>
      <Field fullWidth component={TextField} name="title" label="Title" />
      <Field fullWidth component={DatePicker} name="start" label="Start" />
      <Field fullWidth component={DatePicker} name="end" label="End" />
      <Field
        type="checkbox"
        component={CheckboxWithLabel}
        name="active"
        Label={{
          label: "Active (visible on calendar)",
        }}
        checked={active}
      />
    </List>
  );
};
export default FormTemplate;
