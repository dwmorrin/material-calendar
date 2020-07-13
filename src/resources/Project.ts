import User from "../resources/User";
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
  managers: Pick<User, "id" | "name" | "username">[];
  open: boolean;
  groupSize: number;
  groupAllottedHours: number;
  selected?: boolean;
}

export class Project implements Project {
  static url = "/api/projects";
  static collectionKey = "projects";
  constructor(
    project = {
      id: 0,
      title: "",
      course: { title: "" },
      start: "",
      end: "",
      reservationStart: "",
      allotments: [] as ProjectAllotment[],
      managers: [] as Pick<User, "id" | "name" | "username">[],
      open: false,
      groupSize: 0,
      groupAllottedHours: 0,
    }
  ) {
    Object.assign(this, project);
  }
}

export default Project;
