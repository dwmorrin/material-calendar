import React, { FunctionComponent } from "react";
import { Form, FormikProps } from "formik";
import { FormValues } from "../../../admin/types";
import { Box } from "@material-ui/core";
import SaveButton from "./SaveButton";
import DeleteButton from "./DeleteButton";

interface ResourceFormProps {
  FormFields: FunctionComponent<FormValues>;
}

const ResourceForm: FunctionComponent<
  FormikProps<FormValues> & ResourceFormProps
> = ({ FormFields, handleSubmit, setFieldValue, values }) => (
  <Form onSubmit={handleSubmit}>
    <Box style={{ marginLeft: 10, display: "flex", flexDirection: "column" }}>
      <FormFields {...values} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 30,
        }}
      >
        <SaveButton />
        <DeleteButton
          handleSubmit={handleSubmit}
          setFieldValue={setFieldValue}
        />
      </div>
    </Box>
  </Form>
);

export default ResourceForm;
