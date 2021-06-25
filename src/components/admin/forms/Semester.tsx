import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, CheckboxWithLabel } from "formik-material-ui";
import { DatePicker } from "formik-material-ui-pickers";
import { FormTemplateProps } from "../../../admin/types";
import { List } from "@material-ui/core";
import { isValidDateInterval } from "../../../utils/date";
import ErrorFormLabel from "../../ErrorFormLabel";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({ values }) => {
  const { active } = values;
  const errors = {
    start: isValidDateInterval({
      start: values.start as Date,
      end: values.end as Date,
    })
      ? ""
      : "Start is before end",
  };
  return (
    <List>
      <Field fullWidth component={TextField} name="title" label="Title" />
      {!!errors.start && <ErrorFormLabel>{errors.start}</ErrorFormLabel>}
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
