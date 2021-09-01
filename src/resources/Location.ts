import {
  addDays,
  compareAscSQLDate,
  daysInInterval,
  formatSQLDate,
  getDayFromNumber,
  getDayNumberFromSQLDate,
  parseSQLDate,
} from "../utils/date";

export interface LocationHours {
  id: number;
  hours: number;
  date: string;
}

interface Location {
  [k: string]: unknown;
  id: number;
  title: string;
  groupId: string; // for UI, to group by categories
  selected?: boolean;
  hours: LocationHours[];
  restriction: number;
  allowsWalkIns: boolean;
  defaultHours: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
}

class Location implements Location {
  static url = "/api/locations";
  static locationHoursId = "002-LocationHours"; // magic number to set scheduler order
  constructor(
    location = {
      id: 0,
      title: "",
      groupId: "",
      hours: [] as LocationHours[],
      restriction: 0,
      allowsWalkIns: false,
      defaultHours: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
      },
    }
  ) {
    Object.assign(this, location);
  }

  static getHours(
    location: Location,
    { start, end }: { start: string; end: string }
  ): Omit<LocationHours, "id">[] {
    const numberOfDays = daysInInterval({ start, end });
    const addADay = (s: string): string =>
      formatSQLDate(addDays(parseSQLDate(s), 1));
    const hours = location.hours.slice();
    hours.sort(({ date: start }, { date: end }) =>
      compareAscSQLDate({ start, end })
    );
    let currentDate = start;
    let nextHours = hours.shift();
    let dayPointer = getDayNumberFromSQLDate(currentDate);
    const res = [] as Omit<LocationHours, "id">[];
    while (res.length < numberOfDays) {
      if (nextHours && nextHours.date === currentDate) {
        res.push({ date: nextHours.date, hours: nextHours.hours });
        nextHours = hours.shift();
      } else {
        res.push({
          date: currentDate,
          hours: location.defaultHours[getDayFromNumber(dayPointer)],
        });
      }
      currentDate = addADay(currentDate);
      dayPointer = (dayPointer + 1) % 7;
    }
    return res;
  }

  static getTotalHours(
    location: Location,
    { start, end }: { start: string; end: string }
  ): number {
    const numberOfDays = daysInInterval({ start, end });
    const addADay = (s: string): string =>
      formatSQLDate(addDays(parseSQLDate(s), 1));
    const hours = location.hours.slice();
    hours.sort(({ date: start }, { date: end }) =>
      compareAscSQLDate({ start, end })
    );
    let currentDate = start;
    let nextHours = hours.shift();
    let dayPointer = getDayNumberFromSQLDate(currentDate);
    let total = 0;
    for (let i = 0; i < numberOfDays; ++i) {
      if (nextHours && nextHours.date === currentDate) {
        total += nextHours.hours;
        nextHours = hours.shift();
      } else {
        const day = getDayFromNumber(dayPointer);
        total += location.defaultHours[day];
      }
      currentDate = addADay(currentDate);
      dayPointer = (dayPointer + 1) % 7;
    }
    return total;
  }
}

export default Location;
