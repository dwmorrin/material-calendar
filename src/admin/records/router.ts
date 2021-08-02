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

const router = (
  key: ResourceKey
): ((instance: ResourceInstance, state: AdminState) => string[][]) =>
  ({
    [ResourceKey.Categories]: categoryRecord,
    [ResourceKey.Courses]: courseRecord,
    [ResourceKey.Equipment]: equipmentRecord,
    [ResourceKey.Events]: eventRecord,
    [ResourceKey.Groups]: userGroupRecord,
    [ResourceKey.Locations]: locationRecord,
    [ResourceKey.Projects]: projectRecord,
    [ResourceKey.Reservations]: reservationRecord,
    [ResourceKey.RosterRecords]: rosterRecord,
    [ResourceKey.Sections]: sectionRecord,
    [ResourceKey.Semesters]: semesterRecord,
    [ResourceKey.Tags]: tagRecord,
    [ResourceKey.Users]: userRecord,
    [ResourceKey.VirtualWeeks]: virtualWeekRecord,
  }[key]);

export default router;
