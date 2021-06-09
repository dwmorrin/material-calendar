import React, { FunctionComponent } from "react";
import { Field, FieldArray } from "formik";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { FormTemplateProps, FormValues } from "../../../admin/types";
import { List } from "@material-ui/core";
import FieldList from "./FieldList";
import { ResourceKey } from "../../../resources/types";
import Project from "../../../resources/Project";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({
  values,
  state,
}) => {
  const projects = (state.resources[ResourceKey.Projects] as Project[]).reduce(
    (dict, { title, id }) => ({ ...dict, [title]: String(id) }),
    {} as { [k: string]: string }
  );
  const { email, phone } = (values as FormValues).contact as {
    email: string[];
    phone: string[];
  };
  return (
    <List>
      <Field component={TextField} name="name.first" label="First" />
      <Field component={TextField} name="name.middle" label="Middle" />
      <Field component={TextField} name="name.last" label="Last" />
      <Field fullWidth component={TextField} name="username" label="Username" />
      <FieldList name="contact.email" values={email} />
      <FieldList name="contact.phone" values={phone} />
      <FieldList name="roles" values={values.roles as string[]} />
      <FieldArray
        name="projects"
        render={(): JSX.Element => (
          <>
            {Object.entries(projects).map(([label, value], index) => (
              <div key={index}>
                <Field
                  type="checkbox"
                  component={CheckboxWithLabel}
                  name={"projects.index.title"}
                  Label={{ label }}
                  value={value}
                />
              </div>
            ))}
          </>
        )}
      />
    </List>
  );
};

export default FormTemplate;
