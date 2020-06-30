import RosterRecord from "../../resources/RosterRecord";

const template = (rosterRecord: unknown): string[][] => {
  if (!(rosterRecord instanceof RosterRecord)) {
    return [["", JSON.stringify(rosterRecord)]];
  }
  const { course, student } = rosterRecord;
  return [
    ["Course", `${course.title} (${course.catalogId}-${course.section})`],
    ["Instructor", course.instructor],
    ["Project", course.project.title],
    ["Student", `${student.name.first} ${student.name.last} ${student.id}`],
  ];
};

export default template;
