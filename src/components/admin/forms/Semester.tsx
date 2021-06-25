import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, CheckboxWithLabel } from "formik-material-ui";
import { DatePicker } from "formik-material-ui-pickers";
import { FormTemplateProps } from "../../../admin/types";
import { FormLabel, List, makeStyles } from "@material-ui/core";
import { isValidDateInterval } from "../../../utils/date";

const useStyles = makeStyles({
  error: { color: "red" },
});

const FormTemplate: FunctionComponent<FormTemplateProps> = ({ values }) => {
  const classes = useStyles();
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
      {!!errors.start && (
        <FormLabel className={classes.error}>{errors.start}</FormLabel>
      )}
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
