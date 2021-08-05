import { formatSQLDate } from "../utils/date";

export interface ProjectAllotment {
  locationId: number;
  virtualWeekId: number;
  start: string;
  end: string;
  hours: number;
}

export interface ProjectLocationHours {
  locationId: number;
  hours: number;
}

export interface Project {
  [k: string]: unknown;
  id: number;
  title: string;
  course: { id: number; title: string; sections: string[] };
  start: string;
  end: string;
  reservationStart: string;
  allotments: ProjectAllotment[];
  locationHours: ProjectLocationHours[];
  open: boolean;
  groupSize: number;
  groupAllottedHours: number;
  totalAllottedHours: number;
}

const defaultProject = {
  id: 0,
  title: "",
  course: { title: "", id: -1, sections: [] as string[] },
  start: formatSQLDate(),
  end: formatSQLDate(),
  reservationStart: formatSQLDate(),
  allotments: [] as ProjectAllotment[],
  locationHours: [] as ProjectLocationHours[],
  open: false,
  groupSize: 0,
  groupAllottedHours: 0,
  totalAllottedHours: 0,
};

export class Project implements Project {
  static url = "/api/projects";
  static collectionKey = "projects";
  static allotmentPrefix = "allotment-";
  static walkInTitle = "Walk-in";
  constructor(project = defaultProject) {
    Object.assign(this, project);
  }
}

export { defaultProject };

export default Project;
