import Event from "./Event";
import EventsByDate, { getRange } from "./EventsByDate";

const location = {
  id: 1,
  title: "Room A",
  restriction: 0,
  allowWalkIns: true,
};

const makeReservation = (() => {
  let id = 0;
  return () => ({
    id: ++id,
    projectId: 1,
    groupId: 1,
    description: "Description",
    liveRoom: false,
    guests: "No one",
    notes: "no notes",
    contact: "me@example.com",
    created: "2023-01-01 08:00:00",
    checkIn: null,
    checkOut: null,
  });
})();

const events = [
  new Event({
    id: 1,
    start: "2023-01-01 09:00:00",
    end: "2023-01-01 12:00:00",
    location,
    title: "Event 1",
    reservable: true,
    locked: false,
    reservation: makeReservation(),
  }),
  new Event({
    id: 2,
    start: "2023-01-01 12:30:00",
    end: "2023-01-01 15:30:00",
    location,
    title: "Event 2",
    reservable: true,
    locked: false,
    reservation: makeReservation(),
  }),
  new Event({
    id: 3,
    start: "2023-01-01 16:00:00",
    end: "2023-01-01 19:00:00",
    location,
    title: "Event 3",
    reservable: true,
    locked: false,
    reservation: makeReservation(),
  }),
];

test("?", () => {
  const ebd = new EventsByDate(events);
  const range = getRange(ebd, [1], "2023-01-01", "2023-01-02");
  expect(range).toEqual([
    {
      end: "2023-01-01 19:00:00",
      id: 1,
      location: { allowWalkIns: true, id: 1, restriction: 0, title: "Room A" },
      locked: false,
      next: {
        end: "2023-01-01 15:30:00",
        id: 2,
        location: {
          allowWalkIns: true,
          id: 1,
          restriction: 0,
          title: "Room A",
        },
        locked: false,
        next: {
          end: "2023-01-01 19:00:00",
          id: 3,
          location: {
            allowWalkIns: true,
            id: 1,
            restriction: 0,
            title: "Room A",
          },
          locked: false,
          originalEnd: "2023-01-01 19:00:00",
          reservable: true,
          reservation: {
            checkIn: null,
            checkOut: null,
            contact: "me@example.com",
            created: "2023-01-01 08:00:00",
            description: "Description",
            groupId: 1,
            guests: "No one",
            id: 3,
            liveRoom: false,
            notes: "no notes",
            projectId: 1,
          },
          start: "2023-01-01 16:00:00",
          title: "Event 3",
        },
        originalEnd: "2023-01-01 15:30:00",
        reservable: true,
        reservation: {
          checkIn: null,
          checkOut: null,
          contact: "me@example.com",
          created: "2023-01-01 08:00:00",
          description: "Description",
          groupId: 1,
          guests: "No one",
          id: 2,
          liveRoom: false,
          notes: "no notes",
          projectId: 1,
        },
        start: "2023-01-01 12:30:00",
        title: "Event 2",
      },
      originalEnd: "2023-01-01 12:00:00",
      reservable: true,
      reservation: {
        checkIn: null,
        checkOut: null,
        contact: "me@example.com",
        created: "2023-01-01 08:00:00",
        description: "Description",
        groupId: 1,
        guests: "No one",
        id: 1,
        liveRoom: false,
        notes: "no notes",
        projectId: 1,
      },
      start: "2023-01-01 09:00:00",
      title: "Event 1",
    },
  ]);
});
