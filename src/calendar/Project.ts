export interface Project {
  title: string;
  start: string | Date;
  end: string | Date;
  locationTitles: string[];
}

export class Project {
  constructor(project: Project) {
    Object.assign(this, project);
    this.start = new Date(this.start);
    this.end = new Date(this.end);
  }
}
export default Project;
