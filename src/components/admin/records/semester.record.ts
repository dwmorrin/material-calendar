import Semester from "../../../resources/Semester";
import { formatSlashed, parseSQLDate } from "../../../utils/date";

const template = (semester: unknown): string[][] =>
  semester instanceof Semester
    ? [
        ["ID", semester.id.toString()],
        ["Title", semester.title],
        ["Start", formatSlashed(parseSQLDate(semester.start))],
        ["End", formatSlashed(parseSQLDate(semester.end))],
        ["Active", semester.active.toString()],
      ]
    : [["", JSON.stringify(semester)]];

export default template;
