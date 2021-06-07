import { Manager } from "../resources/User";

export interface ProjectAllotment {
  locationId: number;
  start: string;
  end: string;
  hours: number;
}

export interface Project {
  [k: string]: unknown;
  id: number;
  title: string;
  course: { id: number; title: string };
  start: string;
  end: string;
  reservationStart: string;
  allotments: ProjectAllotment[];
  locations: { [k: string]: boolean };
  managers: Manager[];
  open: boolean;
  groupSize: number;
  groupAllottedHours: number;
  selected?: boolean;
}

const defaultProject = {
  id: 0,
  title: "",
  course: { title: "" },
  start: "",
  end: "",
  reservationStart: "",
  allotments: [] as ProjectAllotment[],
  locations: {},
  managers: [] as Manager[],
  open: false,
  groupSize: 0,
  groupAllottedHours: 0,
};

export class Project implements Project {
  static url = "/api/projects";
  static collectionKey = "projects";
  constructor(project = defaultProject) {
    Object.assign(this, project);
  }
}

export { defaultProject };

export default Project;
