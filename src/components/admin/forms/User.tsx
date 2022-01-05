import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { FormTemplateProps } from "../types";
import { FormLabel, List } from "@material-ui/core";
import { UserValues } from "./user.values";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({ values }) => {
  const { password } = values as UserValues;
  return (
    <List>
      <Field component={TextField} name="name.first" label="First" />
      <Field component={TextField} name="name.middle" label="Middle" />
      <Field component={TextField} name="name.last" label="Last" />
      <br />
      <Field component={TextField} name="username" label="Username" />
      <br />
      <Field component={TextField} name="email" label="Email" />
      <br />
      <Field component={TextField} name="phone" label="Phone" />
      <br />
      <Field component={TextField} name="restriction" label="Restriction" />
      {/* TODO remove hardcoded roles; get roles from database */}
      <br />
      <FormLabel>Roles</FormLabel>
      <br />
      <Field
        component={CheckboxWithLabel}
        type="checkbox"
        name={"roles.admin"}
        Label={{ label: "Admin" }}
      />
      <br />
      <Field
        component={CheckboxWithLabel}
        type="checkbox"
        name={"roles.user"}
        Label={{ label: "User" }}
      />
      <br />
      <br />
      <Field
        component={CheckboxWithLabel}
        type="checkbox"
        name={"password.reset"}
        Label={{ label: "Reset password?" }}
      />
      <br />
      {password.reset && (
        <Field
          component={TextField}
          type="password"
          name="password.value"
          label="New password"
        />
      )}
    </List>
  );
};

export default FormTemplate;
