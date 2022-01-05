import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, RadioGroup } from "formik-material-ui";
import { FormTemplateProps } from "../types";
import { FormControlLabel, FormLabel, List, Radio } from "@material-ui/core";
import { ResourceKey } from "../../../resources/types";
import Course from "../../../resources/Course";
import Section from "../../../resources/Section";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({
  state,
  values,
}) => {
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const sections = state.resources[ResourceKey.Sections] as Section[];
  const courseTitles = Array.from(
    courses.reduce((titles, { title }) => titles.add(title), new Set<string>())
  );
  const selectedCourseTitle = values.course as string;
  const selectedCourse =
    courses.find(({ title }) => title === selectedCourseTitle) || new Course();

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
          selectedCourse.id === section.courseId ? (
            <FormControlLabel
              key={section.id}
              label={`${section.title} - ${section.instructor}`}
              value={section.title}
              control={<Radio />}
            />
          ) : null
        )}
      </Field>
    </List>
  );
};

export default FormTemplate;
