import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, CheckboxWithLabel, Select } from "formik-material-ui";
import { DatePicker } from "formik-material-ui-pickers";
import { FormTemplateProps } from "../../../admin/types";
import { List, MenuItem, InputLabel } from "@material-ui/core";
import { ResourceKey } from "../../../resources/types";
import Location from "../../../resources/Location";

/**
 * value of "location" (singular) is the actual value for the event
 */
const Template: FunctionComponent<FormTemplateProps> = ({ state, values }) => {
  const locations = state.resources[ResourceKey.Locations] as Location[];
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
        name="location.title"
        inputProps={{ id: "eventLocation" }}
      >
        {locations.map(({ title }) => (
          <MenuItem key={title} value={title}>
            {title}
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
