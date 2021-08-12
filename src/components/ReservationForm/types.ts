import { CalendarUIProps } from "../../calendar/types";
import Project from "../../resources/Project";
import UserGroup from "../../resources/UserGroup";
import Event from "../../resources/Event";
import User from "../../resources/User";
import {
  EquipmentReservationValue,
  EquipmentTable,
} from "../../resources/Equipment";

export interface ReservationSubmitValues {
  id: number;
  eventId: number;
  groupId: number;
  projectId: number;
  description: string;
  phone: string;
  liveRoom: boolean;
  guests: string;
  notes: string;
  equipment: EquipmentReservationValue[];
}

export interface ReservationFormValues {
  id: number;
  eventId: number;
  groupId: number;
  projectId: number;
  description: string;
  phone: string;
  liveRoom: string;
  guests: string;
  hasGuests: string;
  hasNotes: string;
  notes: string;
  equipment: EquipmentTable;
  __equipment__: EquipmentTable;
  hasEquipment: string;
}

export type ReservationSubmitProps = Omit<CalendarUIProps, "state"> & {
  closeForm: () => void;
  user: User;
  event: Event;
  groups: UserGroup[];
  projects: Project[];
};
