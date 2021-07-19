import React, { FunctionComponent } from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { FormTemplateProps } from "../../../admin/types";
import { List, FormLabel } from "@material-ui/core";
import Event from "../../../resources/Event";
import Project from "../../../resources/Project";
import { ResourceKey } from "../../../resources/types";

const getEventById = (events: Event[], id: number): Event =>
  events.find((e) => e.id === id) || new Event();

const deleteKey = (obj: Project, key: string): Project => {
  const copy = { ...obj };
  delete copy[key];
  return copy;
};

const getProjectById = (projects: Project[], id: number): Project =>
  deleteKey(
    projects.find((p) => p.id === id) || new Project(),
    "allotments"
  ) as Project;

const FormTemplate: FunctionComponent<FormTemplateProps> = ({
  state,
  values,
}) => (
  <List>
    <Field
      fullWidth
      component={TextField}
      name="description"
      label="Description"
    />
    <Field fullWidth component={TextField} name="eventId" label="Event ID" />
    <FormLabel>Event details</FormLabel>
    <pre>
      {JSON.stringify(
        getEventById(
          state.resources[ResourceKey.Events] as Event[],
          Number(values.eventId)
        ),
        null,
        2
      )}
    </pre>
    <Field
      fullWidth
      component={TextField}
      name="projectId"
      label="Project ID"
    />
    <FormLabel>Project details</FormLabel>
    <pre>
      {JSON.stringify(
        getProjectById(
          state.resources[ResourceKey.Projects] as Project[],
          Number(values.projectId)
        ),
        null,
        2
      )}
    </pre>
    <Field fullWidth component={TextField} name="guests" label="Guests" />
    <FormLabel>Cancellation Request</FormLabel>
    <Field
      fullWidth
      component={TextField}
      name="cancellation.requested.on"
      label="On"
    />
    <Field
      fullWidth
      component={TextField}
      name="cancellation.requested.by"
      label="By"
    />
    <Field
      fullWidth
      component={TextField}
      name="cancellation.requested.comment"
      label="Comment"
    />
    <FormLabel>Cancellation Approved</FormLabel>
    <Field
      fullWidth
      component={TextField}
      name="cancellation.approved.on"
      label="On"
    />
    <Field
      fullWidth
      component={TextField}
      name="cancellation.approved.by"
      label="By"
    />
    <Field
      fullWidth
      component={TextField}
      name="cancellation.approved.comment"
      label="Comment"
    />
    <FormLabel>Cancellation Rejected</FormLabel>
    <Field
      fullWidth
      component={TextField}
      name="cancellation.rejected.on"
      label="On"
    />
    <Field
      fullWidth
      component={TextField}
      name="cancellation.rejected.by"
      label="By"
    />
    <Field
      fullWidth
      component={TextField}
      name="cancellation.rejected.comment"
      label="Comment"
    />
  </List>
);
export default FormTemplate;
