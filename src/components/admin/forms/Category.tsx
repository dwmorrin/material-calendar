import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, RadioGroup } from "formik-material-ui";
import { FormTemplateProps } from "../types";
import { FormControlLabel, FormLabel, List, Radio } from "@material-ui/core";
import { ResourceKey } from "../../../resources/types";
import Category from "../../../resources/Category";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({ state }) => {
  const cats = state.resources[ResourceKey.Categories] as Category[];
  const parents = cats.filter(({ parentId }) => parentId === null);
  return (
    <List>
      <Field fullWidth component={TextField} name="title" label="Title" />
      <FormLabel>Parent</FormLabel>
      <Field component={RadioGroup} name="parentId">
        <FormControlLabel label="None" value="" control={<Radio />} />
        {parents.map(({ id, title }) => (
          <FormControlLabel
            key={id}
            label={title}
            value={String(id)}
            control={<Radio />}
          />
        ))}
      </Field>
    </List>
  );
};
export default FormTemplate;
