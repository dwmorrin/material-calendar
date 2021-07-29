import React, { FunctionComponent } from "react";
import { Field, FieldArray } from "formik";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
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
    {} as Record<string, string>
  );
  return (
    <List>
      <Field component={TextField} name="name.first" label="First" />
      <Field component={TextField} name="name.middle" label="Middle" />
      <Field component={TextField} name="name.last" label="Last" />
      <Field fullWidth component={TextField} name="username" label="Username" />
      <Field component={TextField} name="email" label="Email" />
      <Field component={TextField} name="phone" label="Phone" />
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
