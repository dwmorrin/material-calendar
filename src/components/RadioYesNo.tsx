import React, { FC } from "react";
import { FormControlLabel, FormLabel, Radio } from "@material-ui/core";
import { Field } from "formik";
import { RadioGroup } from "formik-material-ui";

const RadioYesNo: FC<{
  label: string;
  name: string;
  className: string;
}> = ({ label, name, className }) => (
  <section className={className}>
    <FormLabel component="legend">{label}</FormLabel>
    <Field component={RadioGroup} name={name}>
      <FormControlLabel value="yes" control={<Radio />} label="Yes" />
      <FormControlLabel value="no" control={<Radio />} label="No" />
    </Field>
  </section>
);

export default RadioYesNo;
