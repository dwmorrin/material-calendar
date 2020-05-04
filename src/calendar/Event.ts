import {
  EventNonDateInput,
  EventDateInput,
} from "@fullcalendar/core/structs/event";

interface Event extends EventNonDateInput, EventDateInput {
  location: string;
  open: boolean | number;
  reservationId: number | null;
  projectGroupId: number | null;
  equipment: string | null;
}

class Event implements Event {
  constructor(event: Event) {
    Object.assign(this, event);
    this.open = !!this.open;
  }
}

export default Event;
