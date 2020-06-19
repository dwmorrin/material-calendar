import React, { FunctionComponent } from "react";
import { ValueDictionary } from "../../../admin/types";
import { Box, FormLabel } from "@material-ui/core";
import { FieldArray, Field } from "formik";
import { CheckboxWithLabel } from "formik-material-ui";

const CheckboxList: FunctionComponent<{
  name: string;
  values: ValueDictionary;
}> = ({ name, values }) => {
  const keys = Object.keys(values);
  keys.sort(); //! adjust sorting as needed here
  return (
    <Box style={{ marginTop: 20 }}>
      <FormLabel style={{ textTransform: "capitalize" }}>{name}</FormLabel>
      <FieldArray name={name}>
        {(): JSX.Element => (
          <div>
            {keys.map((key, index) => (
              <div key={index}>
                <Field
                  type="checkbox"
                  component={CheckboxWithLabel}
                  name={`${name}[${key}]`}
                  Label={{ label: key }}
                  checked={values[key]}
                />
              </div>
            ))}
          </div>
        )}
      </FieldArray>
    </Box>
  );
};

export default CheckboxList;
