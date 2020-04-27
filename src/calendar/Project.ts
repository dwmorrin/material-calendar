export interface Project {
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
    if (typeof this.locationIds === "string") {
      this.locationIds = JSON.parse(this.locationIds);
    }
  }
}
export default Project;
