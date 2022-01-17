import React, { FunctionComponent } from "react";
import { Field, FieldArray } from "formik";
import { CheckboxWithLabel, TextField, RadioGroup } from "formik-material-ui";
import { FormTemplateProps } from "../types";
import {
  List,
  FormControlLabel,
  FormLabel,
  Box,
  IconButton,
  Button,
  Radio,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import User from "../../../resources/User";
import { ResourceKey } from "../../../resources/types";
import Project from "../../../resources/Project";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({
  state,
  values,
}) => {
  const projects = state.resources[ResourceKey.Projects] as Project[];
  return (
    <List>
      <Field fullWidth component={TextField} name="title" label="Title" />
      <FormLabel>Project</FormLabel>
      <Field component={RadioGroup} name="projectId">
        {projects.map(({ id, title }) => (
          <FormControlLabel
            key={id}
            label={title}
            value={String(id)}
            control={<Radio />}
          />
        ))}
      </Field>
      <h3>
        Warning: group membership editing disabled until logic check added
      </h3>
      <FormLabel>Group members</FormLabel>
      <Box>
        <FieldArray name="members">
          {({ push, remove }): JSX.Element => (
            <div>
              {(values.members as User[]).map((_, index) => (
                <div key={index}>
                  <Field
                    component={TextField}
                    name={`members[${index}]`}
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
      <Field
        Label={{ label: "Pending" }}
        type="checkbox"
        name={"pending"}
        component={CheckboxWithLabel}
      />
    </List>
  );
};

export default FormTemplate;
