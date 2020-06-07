import Category from "./Category";
import Equipment from "./Equipment";
import Event from "./Event";
import Location from "./Location";
import Project from "./Project";
import Course from "./Course";
import Reservation from "./Reservation";
import Tag from "./Tag";
import User from "./User";
import UserGroup from "./UserGroup";
import { enumKeys } from "../utils/enumKeys";

export type Resource =
  | typeof Category
  | typeof Equipment
  | typeof Event
  | typeof Location
  | typeof Project
  | typeof Course
  | typeof Reservation
  | typeof Tag
  | typeof User
  | typeof UserGroup;

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
  Tags,
  Users,
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
    [ResourceKey.Tags]: Tag,
    [ResourceKey.Users]: User,
  }[key]);

/**
 * Array version of FindResource
 */
export const Resources = enumKeys(ResourceKey).map(FindResource);
