import {
  EventNonDateInput,
  EventDateInput,
} from "@fullcalendar/core/structs/event";

interface Event extends EventNonDateInput, EventDateInput {
  location: string;
  open: boolean | number;
}

class Event implements Event {
  constructor(event: Event) {
    Object.assign(this, event);
    this.open = !!this.open;
  }
}

export default Event;
