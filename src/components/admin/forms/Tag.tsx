import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormValues } from "../../../admin/types";
import { List, FormLabel } from "@material-ui/core";
import Category from "../../../resources/Category";

const getCategoryPath = (categories: Category[], id: number): string => {
  const found = categories.find((c) => c.id === id);
  if (!found) return `category ${id} does not exist`;
  return Category.path(categories, found);
};

const FormTemplate: FunctionComponent<FormValues> = ({
  category,
  __options__,
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
        __options__?.categories as Category[],
        +(category as Category).id
      )}
    </FormLabel>
  </List>
);
export default FormTemplate;
