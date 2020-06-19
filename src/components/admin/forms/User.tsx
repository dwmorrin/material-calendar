import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormValues, ValueDictionary } from "../../../admin/types";
import { List } from "@material-ui/core";
import CheckboxList from "./CheckboxList";
import FieldList from "./FieldList";

const FormTemplate: FunctionComponent<FormValues> = ({
  contact,
  roles,
  projects,
}) => {
  const { email, phone } = contact as { email: string[]; phone: string[] };
  return (
    <List>
      <Field component={TextField} name="name.first" label="First" />
      <Field component={TextField} name="name.middle" label="Middle" />
      <Field component={TextField} name="name.last" label="Last" />
      <Field fullWidth component={TextField} name="username" label="Username" />
      <FieldList name="contact.email" values={email} />
      <FieldList name="contact.phone" values={phone} />
      <FieldList name="roles" values={roles as string[]} />
      <CheckboxList name="projects" values={projects as ValueDictionary} />
    </List>
  );
};

export default FormTemplate;
