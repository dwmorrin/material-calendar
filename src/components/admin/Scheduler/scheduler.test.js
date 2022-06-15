import {
  makeResources,
  makeAllotmentEventMap,
  makeAllotmentSummaryEvent,
  getFirstLastAndTotalFromAllotments,
  makeAllotments,
  makeDailyHours,
  processVirtualWeeks,
  processVirtualWeeksAsHoursRemaining,
} from "./lib";
import VirtualWeek from "../../../resources/VirtualWeek";
import Location from "../../../resources/Location";
import Project from "../../../resources/Project";

test("makeResources", () =>
  expect(
    makeResources([], 0, { start: "2020-01-01", end: "2020-01-30" })
  ).toEqual([
    { id: VirtualWeek.resourceId, title: "Virtual Weeks" },
    { id: Location.locationHoursId, title: "Daily Location Hours" },
    {
      id: VirtualWeek.hoursRemainingId,
      title: "Not Allotted/Available for Booking",
      eventBackgroundColor: "grey",
    },
  ]));

test("makeAllotmentSummaryEvent", () =>
  expect(
    makeAllotmentSummaryEvent(
      {
        id: 0,
        title: "PROJECT TITLE",
        start: "2020-06-18",
        end: "2020-06-18",
        locationHours: [{ locationId: 1, hours: 10 }],
      },
      1,
      0
    )
  ).toEqual({
    allDay: true,
    extendedProps: {
      projectId: 0,
    },
    id: "allotmentTotal0",
    start: "2020-06-18",
    end: "2020-06-19",
    resourceId: "0",
    title: "PROJECT TITLE |A:0|M:10|R:NaN|N:NaN",
  }));

test("getFirstLastAndTotalFromAllotments initial", () =>
  expect(getFirstLastAndTotalFromAllotments([{}, {}, 0], { hours: 0 })).toEqual(
    [{ hours: 0 }, { hours: 0 }, 0]
  ));

test("makeAllotments with [] returns []", () =>
  expect(makeAllotments([], 0)).toEqual([]));

test("makeDailyHours", () =>
  expect(
    makeDailyHours(
      [{ date: "2020-06-18", hours: 1 }], // input array from db
      2, // number of days... seems derivable from start and end dates
      { start: "2020-06-18", end: "2020-06-19" } // start and end dates
    )
  ).toEqual([
    [
      {
        allDay: true,
        id: `${Location.locationHoursId}-0`,
        resourceId: Location.locationHoursId,
        start: "2020-06-18",
        title: "1",
      },
      {
        allDay: true,
        id: `${Location.locationHoursId}-1`,
        resourceId: Location.locationHoursId,
        start: "2020-06-19",
        title: "0",
      },
    ],
    [
      { date: "2020-06-18", hours: 1 },
      { date: "2020-06-19", hours: 0 },
    ],
  ]));

test("processVirtualWeeks empty", () =>
  expect(processVirtualWeeks([], 0, [])).toEqual([[], []]));

test("processVirtualWeeks adds a day", () =>
  expect(
    processVirtualWeeks(
      [
        {
          start: "2020-12-31",
          end: "2020-12-31",
          id: 0,
          locationId: 0,
          locationHours: 0,
        },
      ],
      0,
      [{ date: "2020-12-31", hours: 0 }]
    )
  ).toEqual([
    [
      {
        start: "2020-12-31",
        end: "2021-01-01",
        locationId: 0,
        locationHours: 0,
        id: VirtualWeek.eventPrefix + "0",
        resourceId: VirtualWeek.resourceId,
        allDay: true,
        title: "0",
      },
    ],
    [
      {
        id: 0,
        start: "2020-12-31",
        end: "2020-12-31",
        locationId: 0,
        locationHours: 0,
        totalHours: 0,
      },
    ],
  ]));

test("processVirtualWeeksAsHoursRemaining empty", () =>
  expect(processVirtualWeeksAsHoursRemaining([], 0)).toEqual([]));

test("processVirtualWeeksAsHoursRemaining adds a day", () =>
  expect(
    processVirtualWeeksAsHoursRemaining(
      [
        {
          start: "2020-12-31",
          end: "2020-12-31",
          id: 0,
          locationId: 0,
          locationHours: 1,
          projectHours: 1,
          totalHours: 1,
        },
      ],
      0,
      [
        {
          start: "2020-12-31 09:00:00",
          end: "2020-12-31 10:00:00",
          reservation: {},
        },
      ]
    )
  ).toEqual([
    {
      start: "2020-12-31",
      end: "2021-01-01",
      id: "hr0",
      resourceId: VirtualWeek.hoursRemainingId,
      allDay: true,
      title: "0/0",
    },
  ]));
