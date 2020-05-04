import inflate from "../util/inflate";

export interface ProjectLocationAllotment {
  projectId: number;
  locationId: number | string;
  start: Date;
  end: Date;
  hours: number;
}

export interface Project {
  childrenIds: (string | number)[];
  end: string | Date;
  id: string | number;
  locationIds: (string | number)[];
  open?: boolean;
  parentId: string | number;
  reservationEnd: string | Date;
  reservationStart: string | Date;
  selected: boolean;
  start: string | Date;
  title: string;
}

export class Project {
  constructor(project: Project) {
    Object.assign(this, project);
    this.start = new Date(this.start);
    this.end = new Date(this.end);
    this.locationIds = inflate(this.locationIds);
    this.childrenIds = inflate(this.childrenIds);
  }
}

export interface ProjectGroups {
  [k: string]: Project[];
}

export const projectGroupReducer = (
  groups: ProjectGroups | undefined,
  project: Project
): ProjectGroups | undefined => {
  if (!project.parentId) {
    return groups;
  }
  if (groups) {
    if (!groups[project.parentId]) {
      groups[project.parentId] = [project];
      return groups;
    }
    groups[project.parentId].push(project);
    return groups;
  }
};

export default Project;
