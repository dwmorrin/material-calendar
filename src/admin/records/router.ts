import { ResourceKey, ResourceInstance } from "../../resources/types";
import categoryRecord from "./category.record";
import equipmentRecord from "./equipment.record";
import eventRecord from "./event.record";
import locationRecord from "./location.record";
import projectRecord from "./project.record";
import courseRecord from "./courseRecord";
import reservationRecord from "./reservation.record";
import tagRecord from "./tag.record";
import userRecord from "./user.record";
import userGroupRecord from "./userGroup.record";

const router = (
  key: ResourceKey
): ((instance: ResourceInstance) => string[][]) =>
  ({
    [ResourceKey.Categories]: categoryRecord,
    [ResourceKey.Equipment]: equipmentRecord,
    [ResourceKey.Events]: eventRecord,
    [ResourceKey.Groups]: userGroupRecord,
    [ResourceKey.Locations]: locationRecord,
    [ResourceKey.Courses]: courseRecord,
    [ResourceKey.Reservations]: reservationRecord,
    [ResourceKey.Tags]: tagRecord,
    [ResourceKey.Users]: userRecord,
    [ResourceKey.Projects]: projectRecord,
  }[key]);

export default router;
