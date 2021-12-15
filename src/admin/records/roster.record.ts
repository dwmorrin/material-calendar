import RosterRecord from "../../resources/RosterRecord";

const template = (rosterRecord: unknown): string[][] => {
  if (!(rosterRecord instanceof RosterRecord)) {
    return [["", JSON.stringify(rosterRecord)]];
  }
  const { course, student } = rosterRecord;
  return [
    [
      "Course",
      `${course.title} (Course ID:${course.catalogId}-${course.section})`,
    ],
    ["Instructor", course.instructor],
    [
      "Student",
      `${[student.name.first, student.name.middle, student.name.last].join(
        " "
      )}`,
    ],
  ];
};

export default template;
