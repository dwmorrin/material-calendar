import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, CheckboxWithLabel, Select } from "formik-material-ui";
import { DateTimePicker } from "formik-material-ui-pickers";
import { FormTemplateProps } from "../types";
import { List, MenuItem, InputLabel } from "@material-ui/core";
import { ResourceKey } from "../../../resources/types";
import Location from "../../../resources/Location";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({ state }) => {
  const locations = state.resources[ResourceKey.Locations] as Location[];
  return (
    <List>
      <Field
        type="checkbox"
        component={CheckboxWithLabel}
        name={"reservable"}
        Label={{ label: "Accepting reservation requests" }}
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
      <Field fullWidth component={DateTimePicker} name="start" label="Start" />
      <Field fullWidth component={DateTimePicker} name="end" label="End" />
    </List>
  );
};

export default FormTemplate;
