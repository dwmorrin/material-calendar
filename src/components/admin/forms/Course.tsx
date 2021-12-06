import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { List } from "@material-ui/core";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({ state }) => {
  return (
    <List>
      <Field fullWidth component={TextField} name="title" label="Title" />
      <Field
        fullWidth
        component={TextField}
        name="catalogId"
        label="Catalog ID"
      />
    </List>
  );
};

export default FormTemplate;
