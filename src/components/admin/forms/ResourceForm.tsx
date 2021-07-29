import React, { FunctionComponent } from "react";
import { Form, FormikProps } from "formik";
import { AdminState, FormTemplateProps } from "../../../admin/types";
import { Box, DialogContent, Paper } from "@material-ui/core";
import SaveButton from "./SaveButton";
import DeleteButton from "./DeleteButton";

interface ResourceFormProps {
  FormFields: FunctionComponent<FormTemplateProps>;
  state: AdminState;
}

const ResourceForm: FunctionComponent<
  FormikProps<Record<string, unknown>> & ResourceFormProps
> = ({ FormFields, handleSubmit, setFieldValue, values, state }) => (
  <DialogContent>
    <Paper>
      <Form onSubmit={handleSubmit}>
        <Box
          style={{ marginLeft: 10, display: "flex", flexDirection: "column" }}
        >
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
    </Paper>
  </DialogContent>
);

export default ResourceForm;
