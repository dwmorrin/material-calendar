import React, { FunctionComponent } from "react";
import { Field, FieldArray } from "formik";
import { TextField } from "formik-material-ui";
import { Box, IconButton, Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";

const FieldList: FunctionComponent<{ name: string; values: string[] }> = ({
  name,
  values,
}) => {
  // splitting "contact.email" but also works with "email"
  const [first, last] = ((s: string): string[] => {
    const a = s.split(".");
    return [a[0], a[a.length - 1]];
  })(name);
  return (
    <Box
      style={{
        marginTop: 20,
      }}
    >
      <FieldArray name={name}>
        {({ push, remove }): JSX.Element => (
          <div>
            {values.map((_, index) => (
              <div key={index}>
                <Field
                  component={TextField}
                  name={`${name}[${index}]`}
                  // only show label on the first item
                  label={index ? null : first[0].toUpperCase() + first.slice(1)}
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
              Add {last}
            </Button>
          </div>
        )}
      </FieldArray>
    </Box>
  );
};

export default FieldList;
