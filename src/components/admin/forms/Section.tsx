import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, RadioGroup } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { FormLabel, FormControlLabel, List, Radio } from "@material-ui/core";
import { ResourceKey } from "../../../resources/types";
import { Course } from "../../../resources/Course";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({ state }) => {
  const courses = state.resources[ResourceKey.Courses] as Course[];
  return (
    <List>
      <Field fullWidth component={TextField} name="title" label="Title" />
      <Field
        fullWidth
        component={TextField}
        name="instructor"
        label="Instructor"
      />
      <FormLabel>Course</FormLabel>
      <Field component={RadioGroup} name="courseId">
        {courses.map(({ id, title, catalogId }, index) => (
          <FormControlLabel
            key={`course-${id}-${index}`}
            label={`${title} ${catalogId}`}
            value={String(id)}
            control={<Radio />}
          />
        ))}
      </Field>
    </List>
  );
};

export default FormTemplate;
