import Semester from "../../resources/Semester";
import { getFormattedDate } from "../../utils/date";

const template = (semester: unknown): string[][] =>
  semester instanceof Semester
    ? [
        ["ID", semester.id.toString()],
        ["Title", semester.title],
        ["Start", getFormattedDate(semester.start)],
        ["End", getFormattedDate(semester.end)],
        ["Active", semester.active.toString()],
      ]
    : [["", JSON.stringify(semester)]];

export default template;
