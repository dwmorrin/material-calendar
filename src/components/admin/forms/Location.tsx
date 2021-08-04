import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { List, ListItem } from "@material-ui/core";

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
