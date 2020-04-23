export interface Project {
  end: string | Date;
  id?: string | number;
  locationId?: string | number;
  locationTitles?: string[];
  open?: boolean;
  reservationEnd?: string | Date;
  reservationStart?: string | Date;
  start: string | Date;
  title: string;
  userId?: string;
}

export class Project {
  constructor(project: Project) {
    Object.assign(this, project);
    this.start = new Date(this.start);
    this.end = new Date(this.end);
  }
}
export default Project;
