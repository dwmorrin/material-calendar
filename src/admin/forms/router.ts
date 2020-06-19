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
import { values as tagValues, update as tagUpdate } from "./tag.values";
import TagForm from "../../components/admin/forms/Tag";
import { values as userValues, update as userUpdate } from "./user.values";
import UserForm from "../../components/admin/forms/User";

//! placeholders for resources that don't have form interfaces
import EmptyForm from "../../components/admin/forms/Empty";
import User from "../../resources/User";
const newUserUpdater = (): User => new User();
// TODO create interfaces for anything using `empty`
const empty = {
  valuator: (): {} => ({}),
  template: EmptyForm,
  updater: newUserUpdater,
};

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
    [ResourceKey.Groups]: empty,
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
    [ResourceKey.Courses]: empty,
    [ResourceKey.Reservations]: {
      template: ReservationForm,
      valuator: reservationValues,
      updater: reservationUpdate,
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
  }[key]);

export default router;
