import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { List, FormLabel } from "@material-ui/core";
import Category from "../../../resources/Category";
import { ResourceKey } from "../../../resources/types";

const getCategoryPath = (categories: Category[], id: number): string => {
  const found = categories.find((c) => c.id === id);
  if (!found) return `category ${id} does not exist`;
  return Category.path(categories, found);
};

const FormTemplate: FunctionComponent<FormTemplateProps> = ({
  state,
  values,
}) => (
  <List>
    <Field fullWidth component={TextField} name="title" label="Title" />
    <Field
      fullWidth
      component={TextField}
      name="category.id"
      label="Category ID"
    />
    <FormLabel>
      {getCategoryPath(
        state.resources[ResourceKey.Categories] as Category[],
        (values.category as Category).id
      )}
    </FormLabel>
  </List>
);
export default FormTemplate;
