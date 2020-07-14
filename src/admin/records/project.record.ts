import Project from "../../resources/Project";
import User from "../../resources/User";
import { getFormattedDate, getFormattedEventInterval } from "../../utils/date";

const template = (project: unknown): string[][] =>
  project instanceof Project
    ? [
        ["ID", project.id.toString()],
        ["Title", project.title],
        ["Course", project.course.title || "none"],
        ["Duration", getFormattedEventInterval(project.start, project.end)],
        ["Reservations start", getFormattedDate(project.reservationStart)],
        ["Managers", User.getManagerNames(project.managers).join(", ")],
        ["Group size", project.groupSize.toString()],
        ["Allotments", project.allotments.length.toString()],
      ]
    : [["", JSON.stringify(project)]];

export default template;
