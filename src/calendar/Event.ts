import {
  EventNonDateInput,
  EventDateInput,
} from "@fullcalendar/core/structs/event";

interface Event extends EventNonDateInput, EventDateInput {}

class Event implements Event {
  constructor(event: Event) {
    Object.assign(this, event);
    this.resourceId = event.location;
  }
}

export default Event;
