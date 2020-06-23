import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, CheckboxWithLabel, Select } from "formik-material-ui";
import { DatePicker } from "formik-material-ui-pickers";
import { FormValues } from "../../../admin/types";
import { List, MenuItem, InputLabel } from "@material-ui/core";

/**
 * dummy value "locations" populates select; value of "locations" ignored
 * value of "location" (singular) is the actual value for the event
 */
const Template: FunctionComponent<FormValues> = (values) => {
  const locations = values.__options__?.locations as string[];
  const reservable = values.reservable as boolean;
  return (
    <List>
      <Field
        type="checkbox"
        component={CheckboxWithLabel}
        name={"reservable"}
        Label={{ label: "Accepting reservation requests" }}
        checked={reservable}
      />
      <InputLabel htmlFor="eventLocation">Location</InputLabel>
      <Field
        component={Select}
        name="location"
        inputProps={{ id: "eventLocation" }}
      >
        {locations.map((loc) => (
          <MenuItem key={loc} value={loc}>
            {loc}
          </MenuItem>
        ))}
      </Field>
      <Field fullWidth component={TextField} name="title" label="Title" />
      <Field
        fullWidth
        component={TextField}
        name="description"
        label="Description"
        multiline
      />
      <Field fullWidth component={DatePicker} name="start" label="Start" />
      <Field fullWidth component={DatePicker} name="end" label="End" />
      <Field fullWidth component={TextField} name="groupId" label="Group" />
    </List>
  );
};

export default Template;
