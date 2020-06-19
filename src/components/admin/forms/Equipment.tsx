import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, CheckboxWithLabel } from "formik-material-ui";
import { FormValues } from "../../../admin/types";
import { List } from "@material-ui/core";
import FieldList from "./FieldList";

/**
 * does not include reservations (edit reservations in the reservation form)
 * TODO consider adding a way to jump to a reservation through a selection here
 */
const FormTemplate: FunctionComponent<FormValues> = ({ tags, consumable }) => {
  return (
    <List>
      <Field
        fullWidth
        component={TextField}
        name="description"
        label="Description"
      />
      <Field fullWidth component={TextField} name="category" label="Category" />
      <FieldList name="tags" values={tags as string[]} />
      <Field
        fullWidth
        component={TextField}
        name="manufacturer"
        label="Manufacturer"
      />
      <Field fullWidth component={TextField} name="model" label="Model" />
      <Field fullWidth component={TextField} name="sku" label="SKU" />
      <Field fullWidth component={TextField} name="serial" label="Serial #" />
      <Field fullWidth component={TextField} name="barcode" label="Barcode" />
      <Field fullWidth component={TextField} name="quantity" label="Quantity" />
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
