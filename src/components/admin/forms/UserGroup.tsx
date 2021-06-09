import React, { FunctionComponent } from "react";
import { Field, FieldArray } from "formik";
import { TextField } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { List, FormLabel, Box, IconButton, Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import User from "../../../resources/User";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({ values }) => (
  <List>
    <Field
      fullWidth
      component={TextField}
      name="projectId"
      label="Project ID"
    />
    <FormLabel>Group members</FormLabel>
    <Box>
      <FieldArray name="members">
        {({ push, remove }): JSX.Element => (
          <div>
            {(values.members as User[]).map((_, index) => (
              <div key={index}>
                <Field
                  component={TextField}
                  name={`members[${index}].username`}
                  label="Username"
                />
                <IconButton onClick={(): void => remove(index)}>
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button
              onClick={(): void => push("")}
              size="small"
              startIcon={<AddIcon />}
              variant="contained"
            >
              Add group member
            </Button>
          </div>
        )}
      </FieldArray>
    </Box>
    <FormLabel>Reserved hours</FormLabel>
    <p>{String(values.reservedHours)}</p>
  </List>
);

export default FormTemplate;
