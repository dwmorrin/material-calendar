import { ResourceKey, ResourceInstance } from "../../resources/types";
import categoryRecord from "./category.record";
import equipmentRecord from "./equipment.record";
import eventRecord from "./event.record";
import locationRecord from "./location.record";
import projectRecord from "./project.record";
import courseRecord from "./course.record";
import reservationRecord from "./reservation.record";
import rosterRecord from "./roster.record";
import sectionRecord from "./section.record";
import semesterRecord from "./semester.record";
import tagRecord from "./tag.record";
import userRecord from "./user.record";
import userGroupRecord from "./userGroup.record";
import virtualWeekRecord from "./virtualWeek.record";
import { AdminState } from "../types";

type Template = (instance: ResourceInstance, state: AdminState) => string[][];
type FilterFn = (key: string) => (instance: ResourceInstance) => boolean;
type TemplateKeyFilter = [Template, string, FilterFn];

const allPass = () => (): boolean => true;

const lowerIncludes = (a: string, b: string): boolean =>
  a.toLowerCase().includes(b.toLowerCase());

const userFilter =
  (username: string) =>
  (instance: ResourceInstance): boolean =>
    "username" in instance &&
    lowerIncludes(instance.username as string, username);

const rosterFilter =
  (username: string) =>
  (instance: ResourceInstance): boolean => {
    if (!("student" in instance)) return false;
    const student = instance.student as { username: string };
    if (!("username" in student)) return false;
    return lowerIncludes(student.username, username);
  };

const byTitle =
  (title: string) =>
  (instance: ResourceInstance): boolean =>
    "title" in instance && lowerIncludes(instance.title as string, title);

const router = (key: ResourceKey): TemplateKeyFilter =>
  ({
    [ResourceKey.Categories]: [categoryRecord, "Title", byTitle],
    [ResourceKey.Courses]: [courseRecord, "Title", byTitle],
    [ResourceKey.Equipment]: [equipmentRecord, "", allPass],
    [ResourceKey.Events]: [eventRecord, "", allPass],
    [ResourceKey.Groups]: [userGroupRecord, "Title", byTitle],
    [ResourceKey.Locations]: [locationRecord, "Title", byTitle],
    [ResourceKey.Projects]: [projectRecord, "Title", byTitle],
    [ResourceKey.Reservations]: [reservationRecord, "", allPass],
    [ResourceKey.RosterRecords]: [rosterRecord, "Username", rosterFilter],
    [ResourceKey.Sections]: [sectionRecord, "Title", byTitle],
    [ResourceKey.Semesters]: [semesterRecord, "", allPass],
    [ResourceKey.Tags]: [tagRecord, "", allPass],
    [ResourceKey.Users]: [userRecord, "Username", userFilter],
    [ResourceKey.VirtualWeeks]: [virtualWeekRecord, "", allPass],
  }[key] as TemplateKeyFilter);

export default router;
