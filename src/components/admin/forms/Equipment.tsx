import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, CheckboxWithLabel } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { List, FormLabel } from "@material-ui/core";
import FieldList from "./FieldList";
import Category from "../../../resources/Category";
import { ResourceKey } from "../../../resources/types";

const getCategoryPath = (categories: Category[], id: number): string => {
  const found = categories.find((c) => c.id === id);
  if (!found) return `category ${id} does not exist`;
  return Category.path(categories, found);
};

/**
 * does not include reservations (edit reservations in the reservation form)
 * TODO consider adding a way to jump to a reservation through a selection here
 */
const FormTemplate: FunctionComponent<FormTemplateProps> = ({
  values,
  state,
}) => {
  const { category, tags, consumable } = values;
  const categories = state.resources[ResourceKey.Categories] as Category[];
  return (
    <List>
      <Field
        fullWidth
        component={TextField}
        name="manufacturer"
        label="Manufacturer"
      />
      <Field fullWidth component={TextField} name="model" label="Model" />
      <Field
        fullWidth
        component={TextField}
        name="description"
        label="Description"
      />
      <Field fullWidth component={TextField} name="sku" label="SKU" />
      <Field fullWidth component={TextField} name="quantity" label="Quantity" />
      <Field
        fullWidth
        component={TextField}
        name="category"
        label="Category ID"
      />
      <FormLabel>
        {getCategoryPath(categories, +(category as string))}
      </FormLabel>
      <FieldList name="tags" values={tags as string[]} />
      <Field
        type="checkbox"
        component={CheckboxWithLabel}
        name="consumable"
        Label={{ label: "Consumable" }}
        checked={consumable}
      />
    </List>
  );
};

export default FormTemplate;
