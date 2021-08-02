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

const userFilter =
  (username: string) =>
  (instance: ResourceInstance): boolean =>
    "username" in instance &&
    (instance.username as string).startsWith(username);

const rosterFilter =
  (username: string) =>
  (instance: ResourceInstance): boolean => {
    if (!("student" in instance)) return false;
    const student = instance.student as { username: string };
    if (!("username" in student)) return false;
    return student.username.startsWith(username);
  };

const router = (key: ResourceKey): TemplateKeyFilter =>
  ({
    [ResourceKey.Categories]: [categoryRecord, "not working yet", allPass],
    [ResourceKey.Courses]: [courseRecord, "not working yet", allPass],
    [ResourceKey.Equipment]: [equipmentRecord, "not working yet", allPass],
    [ResourceKey.Events]: [eventRecord, "not working yet", allPass],
    [ResourceKey.Groups]: [userGroupRecord, "not working yet", allPass],
    [ResourceKey.Locations]: [locationRecord, "not working yet", allPass],
    [ResourceKey.Projects]: [projectRecord, "not working yet", allPass],
    [ResourceKey.Reservations]: [reservationRecord, "not working yet", allPass],
    [ResourceKey.RosterRecords]: [rosterRecord, "Username", rosterFilter],
    [ResourceKey.Sections]: [sectionRecord, "not working yet", allPass],
    [ResourceKey.Semesters]: [semesterRecord, "not working yet", allPass],
    [ResourceKey.Tags]: [tagRecord, "not working yet", allPass],
    [ResourceKey.Users]: [userRecord, "Username", userFilter],
    [ResourceKey.VirtualWeeks]: [virtualWeekRecord, "not working yet", allPass],
  }[key] as TemplateKeyFilter);

export default router;
