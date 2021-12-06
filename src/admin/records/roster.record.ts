import RosterRecord from "../../resources/RosterRecord";

const template = (rosterRecord: unknown): string[][] => {
  if (!(rosterRecord instanceof RosterRecord)) {
    return [["", JSON.stringify(rosterRecord)]];
  }
  const { section, student } = rosterRecord;
  return [
    [
      "Course",
      `${section.title} (Course ID:${section.courseId}-${section.title})`,
    ],
    ["Instructor", section.instructor],
    [
      "Student",
      `${[student.name.first, student.name.middle, student.name.last].join(
        " "
      )}`,
    ],
  ];
};

export default template;
