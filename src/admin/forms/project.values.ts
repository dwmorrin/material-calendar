import Project from "../../resources/Project";
import { AdminState, FormValues } from "../types";
import { setDefaultDates } from "../../utils/date";

export const values = (state: AdminState): FormValues => {
  const project = state.resourceInstance as Project;

  return {
    ...setDefaultDates(project, "start", "end", "reservationStart"),
    locationIds: project.locationIds.map(String),
  };
};

export const update = (state: AdminState, values: FormValues): Project => {
  const project = new Project(state.resourceInstance as Project);
  const locationIds = (values.locationIds as string[]).map(Number);

  return {
    ...project,
    locationIds,
  };
};
