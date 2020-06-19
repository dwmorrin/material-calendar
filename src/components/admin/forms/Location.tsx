import React, { FunctionComponent } from "react";
import { Field, FieldArray } from "formik";
import { TextField, CheckboxWithLabel } from "formik-material-ui";
import { FormValues } from "../../../admin/types";
import { List, Button, IconButton } from "@material-ui/core";
import { FormBusinessHours } from "../../../resources/Location";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";

const dayLabels = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const initialDays = (): { [k: string]: boolean } => {
  return {
    Sunday: false,
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
  };
};

const FormTemplate: FunctionComponent<FormValues> = (values) => {
  const businessHours = values.businessHours as FormBusinessHours[];
  return (
    <List>
      <Field fullWidth component={TextField} name="title" label="Title" />
      <Field fullWidth component={TextField} name="groupId" label="Group" />
      <Field
        fullWidth
        component={TextField}
        name="eventColor"
        label="Event Color"
      />
      <FieldArray name="businessHours">
        {({ push, remove }): JSX.Element => (
          <div>
            {businessHours.map((bh, index) => (
              <div key={index}>
                {dayLabels.map((day, dayIndex) => (
                  <Field
                    key={dayIndex}
                    type="checkbox"
                    component={CheckboxWithLabel}
                    name={`businessHours[${index}].daysOfWeek[${day}]`}
                    Label={{ label: dayLabels[dayIndex] }}
                    checked={day}
                  />
                ))}
                <Field
                  fullWidth
                  component={TextField}
                  name={`businessHours[${index}].startTime`}
                  label="Start"
                />
                <Field
                  fullWidth
                  component={TextField}
                  name={`businessHours[${index}].endTime`}
                  label="End"
                />
                <IconButton onClick={(): void => remove(index)}>
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button
              onClick={(): void =>
                push({
                  daysOfWeek: initialDays(),
                  startTime: "09:00",
                  endTime: "17:00",
                })
              }
              size="small"
              startIcon={<AddIcon />}
              variant="contained"
            >
              Add business hours
            </Button>
          </div>
        )}
      </FieldArray>
    </List>
  );
};

export default FormTemplate;
