import React, { FunctionComponent } from "react";
import { Field, FieldArray } from "formik";
import { TextField, RadioGroup, CheckboxWithLabel } from "formik-material-ui";
import { DatePicker } from "formik-material-ui-pickers";
import { FormTemplateProps } from "../../../admin/types";
import {
  Button,
  FormControlLabel,
  FormLabel,
  IconButton,
  List,
  Radio,
} from "@material-ui/core";
import { ResourceKey } from "../../../resources/types";
import Course from "../../../resources/Course";
import Location from "../../../resources/Location";
import DeleteIcon from "@material-ui/icons/Delete";
import { ListItem } from "@material-ui/core";

const FormTemplate: FunctionComponent<FormTemplateProps> = ({
  state,
  values,
}) => {
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const locations = state.resources[ResourceKey.Locations] as Location[];
  //! Hard coded project title should be set in .env or similar config file
  return values.title === "Walk-in" ? (
    <div>You cannot edit the Walk-in project</div>
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
      <Field component={RadioGroup} name="course.title">
        {courses.map((course, index) => (
          <FormControlLabel
            key={`${course.title}${index}`}
            label={course.title}
            value={course.title}
            control={<Radio />}
          />
        ))}
        <FormControlLabel label="None" value="" control={<Radio />} />
      </Field>
      <Field
        type="checkbox"
        component={CheckboxWithLabel}
        name="open"
        checked={values.open}
        Label={{ label: "Project is active" }}
      />
      <br />
      <FormLabel>Locations</FormLabel>
      <FieldArray
        name="locationHours"
        render={({ remove, push }): JSX.Element => (
          <>
            {(values.locationHours as []).map((_, index) => (
              <div key={index}>
                <Field
                  component={TextField}
                  name={`locationHours.${index}.locationId`}
                  label="Location ID"
                />
                <Field
                  component={TextField}
                  name={`locationHours.${index}.hours`}
                  label="Hours"
                />
                <IconButton
                  aria-label="delete"
                  onClick={(): void => remove(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button onClick={(): void => push({ locationId: "?", hours: 0 })}>
              Add location to project
            </Button>
          </>
        )}
      />
      {locations.map(({ id, title }, index) => (
        <ListItem key={`locationLookupList${index}`}>
          ID {id}: {title}
        </ListItem>
      ))}
    </List>
  );
};
export default FormTemplate;
