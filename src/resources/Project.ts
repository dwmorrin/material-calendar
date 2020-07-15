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

export class Project implements Project {
  static findLocations(
    allotments: ProjectAllotment[]
  ): { [k: string]: boolean } {
    const locationNames: { [k: number]: string } = {
      1: "Studio 1",
      2: "Studio 2",
      3: "Studio 3",
      4: "Studio 4",
      5: "Production Suite A",
      6: "Production Suite B",
      7: "Rehearsal Room 1",
      8: "Rehearsal Room 2",
      9: "Lab 645",
      10: "Lab 646",
      11: "Critial Listening Room",
      12: "Staff Only",
    };
    const locations: { [k: string]: boolean } = {};
    allotments.forEach(
      (location) => (locations[locationNames[location.locationId]] = true)
    );
    return locations;
  }
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
      managers: [] as Manager[],
      open: false,
      groupSize: 0,
      groupAllottedHours: 0,
    }
  ) {
    Object.assign(this, project);
    this.locations = Project.findLocations(this.allotments);
  }
}

export default Project;
