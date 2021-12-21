import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField, RadioGroup, CheckboxWithLabel } from "formik-material-ui";
import { DatePicker } from "formik-material-ui-pickers";
import { FormTemplateProps } from "../../../admin/types";
import { FormControlLabel, FormLabel, List, Radio } from "@material-ui/core";
import { ResourceKey } from "../../../resources/types";
import Course from "../../../resources/Course";
import Project from "../../../resources/Project";
import Location from "../../../resources/Location";
import { ProjectValues } from "../../../admin/forms/project.values";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({
  state,
  values,
}) => {
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const course = (values as ProjectValues).course;
  const selectedCourse =
    courses.find((c) => c.title === course) || new Course();
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const sections = Object.entries(
    values.sections as Record<number, Record<string, boolean>>
  );
  const sectionOptions = sections.filter(
    ([courseId]) => +courseId === selectedCourse.id
  );
  return values.title === Project.walkInTitle ? (
    <div>You cannot edit the {values.title} project</div>
  ) : (
    <List>
      <Field fullWidth component={TextField} name="title" label="Title" />
      <Field fullWidth component={DatePicker} name="start" label="Start" />
      <Field fullWidth component={DatePicker} name="end" label="End" />
      <Field
        fullWidth
        component={DatePicker}
        name="reservationStart"
        label="Reservations start"
      />
      <Field
        fullWidth
        component={TextField}
        name="groupSize"
        label="Group size"
      />
      <Field
        fullWidth
        component={TextField}
        name="groupAllottedHours"
        label="Group allotted hours"
      />
      <FormLabel>Course</FormLabel>
      <Field component={RadioGroup} name="course">
        {courses.map((course) => (
          <FormControlLabel
            key={`Course-${course.id}`}
            label={course.title}
            value={course.title}
            control={<Radio />}
          />
        ))}
        <FormControlLabel label="None" value="" control={<Radio />} />
      </Field>
      <FormLabel>Sections</FormLabel>
      <br />
      {sectionOptions.map(([title, section]) =>
        Object.entries(section).map(([sectionTitle, checked], index) => (
          <Field
            checked={checked}
            key={`${sectionTitle}${index}`}
            component={CheckboxWithLabel}
            type="checkbox"
            name={`sections[${title}][${sectionTitle}]`}
            Label={{ label: sectionTitle }}
          />
        ))
      )}
      <br />
      <Field
        type="checkbox"
        component={CheckboxWithLabel}
        name="open"
        checked={values.open}
        Label={{ label: "Project is active" }}
      />
      <br />
      <FormLabel>Locations</FormLabel>
      <br />
      {locations.map(({ id, title }, index) => (
        <>
          <Field
            key={`location-checkbox-${id}-${index}`}
            component={CheckboxWithLabel}
            type="checkbox"
            name={`locations.${id}.selected`}
            Label={{ label: title }}
          />
          {(values as ProjectValues).locations[id].selected && (
            <Field
              component={TextField}
              name={`locations.${id}.hours`}
              label="Hours"
            />
          )}
          <br />
        </>
      ))}
    </List>
  );
};
export default FormTemplate;
