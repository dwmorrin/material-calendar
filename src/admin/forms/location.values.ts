import Location from // Days,
// BusinessHours,
// FormBusinessHours,
"../../resources/Location";
import { FormValues, AdminState } from "../types";

// const getFormHours = (hours: BusinessHours[]): FormBusinessHours[] =>
//   hours.map(({ daysOfWeek, startTime, endTime }) => ({
//     startTime,
//     endTime,
//     daysOfWeek: {
//       Sunday: daysOfWeek.includes(Days.Sunday),
//       Monday: daysOfWeek.includes(Days.Monday),
//       Tuesday: daysOfWeek.includes(Days.Tuesday),
//       Wednesday: daysOfWeek.includes(Days.Wednesday),
//       Thursday: daysOfWeek.includes(Days.Thursday),
//       Friday: daysOfWeek.includes(Days.Friday),
//       Saturday: daysOfWeek.includes(Days.Saturday),
//     },
//   }));

// const getChoices = (choices: { [k: string]: boolean }): number[] =>
//   Object.keys(choices).reduce(
//     (chosen, key, index) => (choices[key] ? [...chosen, index] : chosen),
//     [] as number[]
//   );

// const getHours = (hours: FormBusinessHours[]): BusinessHours[] =>
//   hours.map(({ daysOfWeek, startTime, endTime }) => ({
//     startTime,
//     endTime,
//     daysOfWeek: getChoices(daysOfWeek),
//   }));

export const values = (state: AdminState): FormValues => {
  const location = state.resourceInstance as Location;

  return {
    ...location,
  };
};

export const update = (state: AdminState, values: FormValues): Location => {
  const location = new Location(state.resourceInstance as Location);
  delete location.selected; // prop is client-only; does not exist on server

  return {
    ...location,
    ...values,
    // businessHours: getHours(values.businessHours as FormBusinessHours[]),
  };
};
