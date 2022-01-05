import React, { FunctionComponent } from "react";
import { FormLabel, List, ListItem } from "@material-ui/core";
import { Field } from "formik";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { FormTemplateProps } from "../types";

const FormTemplate: FunctionComponent<FormTemplateProps> = () => (
  <List>
    <ListItem>
      <Field fullWidth component={TextField} name="title" label="Title" />
    </ListItem>
    <ListItem>
      <Field fullWidth component={TextField} name="groupId" label="Group" />
    </ListItem>
    <ListItem>
      <Field component={TextField} name="restriction" label="Restriction" />
    </ListItem>
    <ListItem>
      <Field
        component={CheckboxWithLabel}
        type="checkbox"
        name={"allowsWalkIns"}
        Label={{ label: "Walk-in reservations are allowed" }}
      />
    </ListItem>
    <ListItem>
      <FormLabel>Default hours per day (0-24)</FormLabel>
    </ListItem>
    <ListItem>
      <Field component={TextField} name="defaultHours.monday" label="Monday" />
    </ListItem>
    <ListItem>
      <Field
        component={TextField}
        name="defaultHours.tuesday"
        label="Tuesday"
      />
    </ListItem>
    <ListItem>
      <Field
        component={TextField}
        name="defaultHours.wednesday"
        label="Wednesday"
      />
    </ListItem>
    <ListItem>
      <Field
        component={TextField}
        name="defaultHours.thursday"
        label="Thursday"
      />
    </ListItem>
    <ListItem>
      <Field component={TextField} name="defaultHours.friday" label="Friday" />
    </ListItem>
    <ListItem>
      <Field
        component={TextField}
        name="defaultHours.saturday"
        label="Saturday"
      />
    </ListItem>
    <ListItem>
      <Field component={TextField} name="defaultHours.sunday" label="Sunday" />
    </ListItem>
  </List>
);

export default FormTemplate;
