import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { FormLabel, List } from "@material-ui/core";

const FormTemplate: FunctionComponent<FormTemplateProps> = () => (
  <List>
    <Field fullWidth component={TextField} name="title" label="Title" />
    <Field fullWidth component={TextField} name="groupId" label="Group" />
    <Field
      fullWidth
      component={TextField}
      name="restriction"
      label="Restriction"
    />
    <FormLabel>Roles</FormLabel>
    <br />
    <Field
      component={CheckboxWithLabel}
      type="checkbox"
      name={"allowsWalkIns"}
      Label={{ label: "Walk-in reservations are allowed" }}
    />
  </List>
);

export default FormTemplate;
