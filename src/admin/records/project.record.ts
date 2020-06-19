import Project from "../../resources/Project";
import { getFormattedEventInterval } from "../../utils/date";

const template = (project: unknown): string[][] =>
  project instanceof Project
    ? [
        ["Title", project.title],
        ["Duration", getFormattedEventInterval(project.start, project.end)],
        ["Managers", project.managers.length.toString()],
        ["Group", project.course.title || "none"],
      ]
    : [["", JSON.stringify(project)]];

export default template;
