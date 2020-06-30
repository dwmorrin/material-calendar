import Category from "./Category";
import Equipment from "./Equipment";
import Event from "./Event";
import Location from "./Location";
import Project from "./Project";
import Course from "./Course";
import Reservation from "./Reservation";
import RosterRecord from "./RosterRecord";
import Semester from "./Semester";
import Tag from "./Tag";
import User from "./User";
import UserGroup from "./UserGroup";
import VirtualWeek from "./VirtualWeek";
import { enumKeys } from "../utils/enumKeys";

export type Resource =
  | typeof Category
  | typeof Equipment
  | typeof Event
  | typeof Location
  | typeof Project
  | typeof Course
  | typeof Reservation
  | typeof RosterRecord
  | typeof Semester
  | typeof Tag
  | typeof User
  | typeof UserGroup
  | typeof VirtualWeek;

export type ResourceInstance = InstanceType<Resource>;

export enum ResourceKey {
  Categories,
  Equipment,
  Events,
  Groups,
  Locations,
  Projects,
  Courses,
  Reservations,
  RosterRecords,
  Semesters,
  Tags,
  Users,
  VirtualWeeks,
}

export const FindResource = (key: ResourceKey): Resource =>
  ({
    [ResourceKey.Categories]: Category,
    [ResourceKey.Equipment]: Equipment,
    [ResourceKey.Events]: Event,
    [ResourceKey.Groups]: UserGroup,
    [ResourceKey.Locations]: Location,
    [ResourceKey.Courses]: Course,
    [ResourceKey.Projects]: Project,
    [ResourceKey.Reservations]: Reservation,
    [ResourceKey.RosterRecords]: RosterRecord,
    [ResourceKey.Semesters]: Semester,
    [ResourceKey.Tags]: Tag,
    [ResourceKey.Users]: User,
    [ResourceKey.VirtualWeeks]: VirtualWeek,
  }[key]);

/**
 * Array version of FindResource
 */
export const Resources = enumKeys(ResourceKey).map(FindResource);
