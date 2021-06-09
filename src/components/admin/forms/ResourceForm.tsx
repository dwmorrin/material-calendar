import React, { FunctionComponent } from "react";
import { Form, FormikProps } from "formik";
import {
  FormValues,
  FormTemplateProps,
  AdminState,
} from "../../../admin/types";
import { Box } from "@material-ui/core";
import SaveButton from "./SaveButton";
import DeleteButton from "./DeleteButton";

interface ResourceFormProps {
  FormFields: FunctionComponent<FormTemplateProps>;
  state: AdminState;
}

const ResourceForm: FunctionComponent<
  FormikProps<FormValues> & ResourceFormProps
> = ({ FormFields, handleSubmit, setFieldValue, values, state }) => (
  <Form onSubmit={handleSubmit}>
    <Box style={{ marginLeft: 10, display: "flex", flexDirection: "column" }}>
      <h2>
        Warning: this interface under construction and may not write to the
        database correctly.
      </h2>
      <FormFields values={values} state={state} />
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
      {process.env.NODE_ENV === "development" ? (
        <pre>{JSON.stringify(values, null, 2)}</pre>
      ) : null}
    </Box>
  </Form>
);

export default ResourceForm;
