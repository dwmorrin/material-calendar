import { parseRoster } from "../admin/bulkImport/roster.import";

/**
 * Roster data files have newline separated records, tab separated fields.
 * Each roster records contains the following fields, in this order:
 * COURSE TITLE,
 * COURSE ID,
 * SECTION ID,
 * INSTRUCTOR NAME, (no format)
 * STUDENT NAME, ("last, first" format)
 * STUDENT ID, (typically 1-3 letters followed by 1-4 digits)
 * PROJECT TITLE
 */
const englishRecord = {
  course: {
    title: "English Composition",
    catalogId: "UNI 001",
    section: "001",
    instructor: "Alice Adams",
    project: { title: "Persuassive Essays" },
  },
  student: { name: { first: "Bob", last: "Billy" }, id: "bb123" },
};
const chemistryRecord = {
  course: {
    title: "Intro to Chemistry",
    catalogId: "UNI 002",
    section: "001",
    instructor: "Carol Charles",
    project: { title: "Acids and Bases" },
  },
  student: { name: { first: "Donald", last: "Dudley" }, id: "dd456" },
};
const englishRecordString =
  "English Composition\tUNI 001\t001\tAlice Adams\tBilly, Bob\tbb123\tPersuassive Essays";
const chemistryRecordString =
  "Intro to Chemistry\tUNI 002\t001\tCarol Charles\tDudley, Donald\tdd456\tAcids and Bases";
const rosterString = `\n${englishRecordString}\n${chemistryRecordString}\n`;

const incompleteRecord = "a\tb\tc\t";
const incompleteRoster = `\n${englishRecordString}\n${incompleteRecord}\n${chemistryRecordString}`;

test("parse roster", () => {
  const { users, courses, roster, errors } = parseRoster(rosterString);
  expect(errors.length).toBe(0);
  expect(Object.keys(users).length).toBe(2);
  expect(users["dd456"]).toEqual(chemistryRecord.student);
  expect(courses["Intro to Chemistry"]).toEqual(chemistryRecord.course);
  expect(courses["English Composition"]).toEqual(englishRecord.course);
  expect(roster.length).toBe(2);
  expect(parseRoster().errors.length).toBe(1);
  expect(parseRoster(incompleteRoster).errors.length).toBe(1);
});
