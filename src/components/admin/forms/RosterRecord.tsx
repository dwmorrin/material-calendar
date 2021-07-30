import React, { Fragment, FunctionComponent } from "react";
import { Field } from "formik";
import { CheckboxWithLabel, TextField, RadioGroup } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { FormControlLabel, FormLabel, List, Radio } from "@material-ui/core";
import { ResourceKey } from "../../../resources/types";
import Course from "../../../resources/Course";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({
  state,
  values,
}) => {
  const sections = state.resources[ResourceKey.Courses] as Course[];
  const courseTitles = Array.from(
    sections.reduce((titles, { title }) => titles.add(title), new Set<string>())
  );
  const selectedCourse = values.course as string;

  return (
    <List>
      <Field fullWidth component={TextField} name="username" label="Username" />
      <FormLabel>Course</FormLabel>
      <Field component={RadioGroup} name="course">
        {courseTitles.map((title, index) => (
          <FormControlLabel
            key={`${title}${index}`}
            label={title}
            value={title}
            control={<Radio />}
          />
        ))}
      </Field>
      <FormLabel>Section</FormLabel>
      <Field component={RadioGroup} name="section">
        {sections.map((section) =>
          selectedCourse === section.title ? (
            <FormControlLabel
              key={`${section.title}${section.section}`}
              label={`${section.section} - ${section.instructor}`}
              value={section.section}
              control={<Radio />}
            />
          ) : null
        )}
      </Field>
    </List>
  );
};

export default FormTemplate;
