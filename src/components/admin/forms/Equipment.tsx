import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, CheckboxWithLabel, RadioGroup } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { FormLabel, FormControlLabel, List, Radio } from "@material-ui/core";
// import FieldList from "./FieldList"; // TODO: implement tags
import Category from "../../../resources/Category";
import { ResourceKey } from "../../../resources/types";

const getCategoryPath = (categories: Category[], id: number): string => {
  const found = categories.find((c) => c.id === id);
  if (!found) return `category ${id} does not exist`;
  return Category.path(categories, found);
};

interface CategoryListItem {
  id: number;
  path: string;
}

const FormTemplate: FunctionComponent<FormTemplateProps> = ({ state }) => {
  const categories = state.resources[ResourceKey.Categories] as Category[];
  const catList = categories.map(({ id }) => ({
    id,
    path: getCategoryPath(categories, id),
  })) as CategoryListItem[];
  catList.sort(({ path: a }, { path: b }) => (a < b ? -1 : a > b ? 1 : 0));
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
      <Field fullWidth component={TextField} name="serial" label="Serial" />
      <Field
        fullWidth
        component={TextField}
        name="restriction"
        label="Restriction"
      />
      <Field fullWidth component={TextField} name="quantity" label="Quantity" />
      <Field
        type="checkbox"
        component={CheckboxWithLabel}
        name="consumable"
        Label={{ label: "Consumable" }}
      />
      <br />
      <FormLabel>Category</FormLabel>
      <Field component={RadioGroup} name="categoryId">
        {catList.map(({ id, path }) => (
          <FormControlLabel
            key={id}
            label={path}
            value={String(id)}
            control={<Radio />}
          />
        ))}
      </Field>
      <Field fullWidth component={TextField} name="notes" label="Notes" />
      {/* TODO: implement tags feature */}
      {/* <FieldList name="tags" values={tags as string[]} /> */}
    </List>
  );
};

export default FormTemplate;
