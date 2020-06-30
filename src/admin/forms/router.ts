/**
 * Alternative would be to attach values, update & <Form> to the class.
 * Attempt to import files into the class failed (could try again).
 * Writing out the code inside the class files would make the class files too
 *   big.
 */
import { FunctionComponent } from "react";
import { AdminState, FormValues } from "../types";
import { ResourceKey, ResourceInstance } from "../../resources/types";
import {
  values as categoryValues,
  update as categoryUpdate,
} from "./category.values";
import CategoryForm from "../../components/admin/forms/Category";
import {
  values as courseValues,
  update as courseUpdate,
} from "./course.values";
import CourseForm from "../../components/admin/forms/Course";
import {
  values as equipmentValues,
  update as equipmentUpdate,
} from "./equiment.values";
import EquipmentForm from "../../components/admin/forms/Equipment";
import { values as eventValues, update as eventUpdate } from "./event.values";
import EventForm from "../../components/admin/forms/Event";
import {
  values as locationValues,
  update as locationUpdate,
} from "./location.values";
import LocationForm from "../../components/admin/forms/Location";
import {
  values as projectValues,
  update as projectUpdate,
} from "./project.values";
import ProjectForm from "../../components/admin/forms/Project";
import {
  values as reservationValues,
  update as reservationUpdate,
} from "./reservation.values";
import ReservationForm from "../../components/admin/forms/Reservation";
import {
  values as rosterValues,
  update as rosterUpdate,
} from "./roster.values";
import RosterForm from "../../components/admin/forms/RosterRecord";
import {
  values as semesterValues,
  update as semesterUpdate,
} from "./semester.values";
import SemesterForm from "../../components/admin/forms/Semester";
import { values as tagValues, update as tagUpdate } from "./tag.values";
import TagForm from "../../components/admin/forms/Tag";
import { values as userValues, update as userUpdate } from "./user.values";
import UserForm from "../../components/admin/forms/User";
import {
  values as groupValues,
  update as groupUpdate,
} from "./userGroup.values";
import GroupForm from "../../components/admin/forms/UserGroup";
import {
  values as virtualWeekValues,
  update as virtualWeekUpdate,
} from "./virtualWeek.values";
import VirtualWeekForm from "../../components/admin/forms/VirtualWeek";

/**
 * router generates values and a template to render some database resource
 * record into a Formik form.
 */
const router = (
  key: ResourceKey
): {
  valuator: (state: AdminState) => FormValues;
  template: FunctionComponent<FormValues>;
  updater: (state: AdminState, values: FormValues) => ResourceInstance;
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
