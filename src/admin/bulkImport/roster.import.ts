import RosterRecord, {
  Student,
  Course as RosterCourse,
} from "../../resources/RosterRecord";
import Course from "../../resources/Course";
import { tsv } from "../../utils/csv";
import { AdminAction } from "../types";
import User from "../../resources/User";

const lineIsBlank = (line: string[]): boolean =>
  line.length === 1 && line[0] === "";
const lineIsNotBlank = (line: string[]): boolean => !lineIsBlank(line);

/**
 * Produces 4 lists: users, courses, projects, roster records, and errors
 * @param rosterString tab separated values, newline separated records
 */
export const parseRoster = (
  rosterString: string
): {
  users: { [k: string]: Student };
  courses: { [k: string]: RosterCourse };
  roster: RosterRecord[];
  errors: Error[];
} => {
  try {
    const rawParse = tsv(rosterString);
    return rawParse.filter(lineIsNotBlank).reduce(
      (lists, line, index) => {
        try {
          const record = RosterRecord.read(new RosterRecord(), line);
          lists.roster.push(record);
          if (!(record.student.id in lists.users))
            lists.users[record.student.id] = record.student;
          if (!(record.course.title in lists.courses))
            lists.courses[record.course.title] = record.course;
        } catch (error) {
          lists.errors.push(
            new Error(
              `In roster import, line ${
                index + 1
              } rejected. Line contents: ${JSON.stringify(line)}`
            )
          );
        }
        return lists;
      },
      {
        users: {} as { [k: string]: Student },
        courses: {} as { [k: string]: RosterCourse },
        roster: [] as RosterRecord[],
        errors: [] as Error[],
      }
    );
  } catch (error) {
    return {
      users: {},
      courses: {},
      roster: [],
      errors: [error],
    };
  }
};

const bulkImport = (
  dispatch: (action: { type: AdminAction; payload: {} }) => void,
  rosterString: string
): void => {
  const { users, courses, roster, errors } = parseRoster(rosterString);
  if (errors) {
    return dispatch({ type: AdminAction.Error, payload: { error: errors } });
  }
  const requests = [
    { url: `${User.url}/bulk`, body: JSON.stringify(Object.values(users)) },
    { url: `${Course.url}/bulk`, body: JSON.stringify(Object.values(courses)) },
    { url: `${RosterRecord.url}/bulk`, body: JSON.stringify(roster) },
  ];

  Promise.all(
    requests.map(({ url, body }) => fetch(url, { method: "POST", body }))
  ).then((responses) =>
    Promise.all(responses.map((response) => response.json()))
      .then((dataArray) =>
        dispatch({
          type: AdminAction.Error,
          payload: {
            error: "you didn't implement the bulk import success handler",
          },
        })
      )
      .catch((error) =>
        dispatch({
          type: AdminAction.Error,
          payload: {
            error: "you didn't implmenet the bulk import error handler",
          },
        })
      )
  );
};

export default bulkImport;
