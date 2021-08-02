import Category from "./Category";
import Equipment from "./Equipment";
import Event from "./Event";
import Location from "./Location";
import Project from "./Project";
import Course from "./Course";
import Reservation from "./Reservation";
import RosterRecord from "./RosterRecord";
import Section from "./Section";
import Semester from "./Semester";
import Tag from "./Tag";
import User from "./User";
import UserGroup from "./UserGroup";
import VirtualWeek from "./VirtualWeek";

export type Resource =
  | typeof Category
  | typeof Equipment
  | typeof Event
  | typeof Location
  | typeof Project
  | typeof Course
  | typeof Reservation
  | typeof RosterRecord
  | typeof Section
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
  Sections,
  Semesters,
  Tags,
  Users,
  VirtualWeeks,
}
