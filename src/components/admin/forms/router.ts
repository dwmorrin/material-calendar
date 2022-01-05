/**
 * Alternative would be to attach values, update & <Form> to the class.
 * Attempt to import files into the class failed (could try again).
 * Writing out the code inside the class files would make the class files too
 *   big.
 */
import { FunctionComponent } from "react";
import { AdminState, FormTemplateProps } from "../../../admin/types";
import { ResourceKey, ResourceInstance } from "../../../resources/types";
import {
  values as categoryValues,
  update as categoryUpdate,
} from "./category.values";
import CategoryForm from "./Category";
import {
  values as courseValues,
  update as courseUpdate,
} from "./course.values";
import CourseForm from "./Course";
import {
  values as equipmentValues,
  update as equipmentUpdate,
} from "./equipment.values";
import EquipmentForm from "./Equipment";
import { values as eventValues, update as eventUpdate } from "./event.values";
import EventForm from "./Event";
import {
  values as locationValues,
  update as locationUpdate,
} from "./location.values";
import LocationForm from "./Location";
import {
  values as projectValues,
  update as projectUpdate,
} from "./project.values";
import ProjectForm from "./Project";
import {
  values as reservationValues,
  update as reservationUpdate,
} from "./reservation.values";
import ReservationForm from "./Reservation";
import {
  values as rosterValues,
  update as rosterUpdate,
} from "./roster.values";
import RosterForm from "./RosterRecord";
import {
  values as sectionValues,
  update as sectionUpdate,
} from "./section.values";
import SectionForm from "./Section";
import {
  values as semesterValues,
  update as semesterUpdate,
} from "./semester.values";
import SemesterForm from "./Semester";
import { values as tagValues, update as tagUpdate } from "./tag.values";
import TagForm from "./Tag";
import { values as userValues, update as userUpdate } from "./user.values";
import UserForm from "./User";
import {
  values as groupValues,
  update as groupUpdate,
} from "./userGroup.values";
import GroupForm from "./UserGroup";
import {
  values as virtualWeekValues,
  update as virtualWeekUpdate,
} from "./virtualWeek.values";
import VirtualWeekForm from "./VirtualWeek";

/**
 * router generates values and a template to render some database resource
 * record into a Formik form.
 */
const router = (
  key: ResourceKey
): {
  valuator: (state: AdminState) => Record<string, unknown>;
  template: FunctionComponent<FormTemplateProps>;
  updater: (
    state: AdminState,
    values: Record<string, unknown>
  ) => ResourceInstance;
} =>
  ({
    [ResourceKey.Categories]: {
      template: CategoryForm,
      valuator: categoryValues,
      updater: categoryUpdate,
    },
    [ResourceKey.Courses]: {
      template: CourseForm,
      valuator: courseValues,
      updater: courseUpdate,
    },
    [ResourceKey.Equipment]: {
      template: EquipmentForm,
      valuator: equipmentValues,
      updater: equipmentUpdate,
    },
    [ResourceKey.Events]: {
      template: EventForm,
      valuator: eventValues,
      updater: eventUpdate,
    },
    [ResourceKey.Groups]: {
      template: GroupForm,
      valuator: groupValues,
      updater: groupUpdate,
    },
    [ResourceKey.Locations]: {
      template: LocationForm,
      valuator: locationValues,
      updater: locationUpdate,
    },
    [ResourceKey.Projects]: {
      template: ProjectForm,
      valuator: projectValues,
      updater: projectUpdate,
    },
    [ResourceKey.Reservations]: {
      template: ReservationForm,
      valuator: reservationValues,
      updater: reservationUpdate,
    },
    [ResourceKey.RosterRecords]: {
      template: RosterForm,
      valuator: rosterValues,
      updater: rosterUpdate,
    },
    [ResourceKey.Sections]: {
      template: SectionForm,
      valuator: sectionValues,
      updater: sectionUpdate,
    },
    [ResourceKey.Semesters]: {
      template: SemesterForm,
      valuator: semesterValues,
      updater: semesterUpdate,
    },
    [ResourceKey.Tags]: {
      template: TagForm,
      valuator: tagValues,
      updater: tagUpdate,
    },
    [ResourceKey.Users]: {
      template: UserForm,
      valuator: userValues,
      updater: userUpdate,
    },
    [ResourceKey.VirtualWeeks]: {
      template: VirtualWeekForm,
      valuator: virtualWeekValues,
      updater: virtualWeekUpdate,
    },
  }[key]);

export default router;
