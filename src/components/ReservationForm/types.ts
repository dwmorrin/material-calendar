import { Action } from "../../calendar/types";
import Project from "../../resources/Project";
import UserGroup from "../../resources/UserGroup";
import Event from "../../resources/Event";
import User from "../../resources/User";
import { EquipmentTable } from "./EquipmentForm/types";

export interface ReservationFormValues extends Record<string, unknown> {
  event?: number;
  groupId?: number;
  project: number;
  description: string;
  phone: string;
  liveRoom: string;
  guests: string;
  hasGuests: string;
  hasNotes: string;
  equipment: EquipmentTable;
  __equipment__: EquipmentTable;
  hasEquipment: string;
}

export interface ReservationSubmitProps {
  closeForm: () => void;
  dispatch: (action: Action) => void;
  user: User;
  event?: Event;
  groups: UserGroup[];
  projects: Project[];
}
