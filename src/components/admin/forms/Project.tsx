import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { DatePicker } from "formik-material-ui-pickers";
import { FormValues, ValueDictionary } from "../../../admin/types";
import { List } from "@material-ui/core";
import CheckboxList from "./CheckboxList";
import FieldList from "./FieldList";
import { makeManagerList } from "../../../utils/managerList";
import User from "../../../resources/User";

// TODO need a radio for the group, not checkbox
const FormTemplate: FunctionComponent<FormValues> = ({
  managers,
  __options__,
}) => (
  <List>
    <Field fullWidth component={TextField} name="title" label="Title" />
    <Field fullWidth component={DatePicker} name="start" label="Start" />
    <Field fullWidth component={DatePicker} name="end" label="End" />
    <Field
      fullWidth
      component={DatePicker}
      name="reservationStart"
      label="Reservations start"
    />
    <FieldList
      name="managers"
      values={makeManagerList(
        managers as Pick<User, "id" | "name" | "username">[]
      )}
    />
    <Field
      fullWidth
      component={TextField}
      name="groupSize"
      label="Group size"
    />
    <Field
      fullWidth
      component={TextField}
      name="groupAllottedHours"
      label="Group allotted hours"
    />
    <CheckboxList //! BUG checkboxes value cannot be boolean, needs fix
      name="course"
      values={__options__?.courses as ValueDictionary}
    />
  </List>
);
export default FormTemplate;
