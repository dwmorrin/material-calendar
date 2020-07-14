import { AdminAction, Action } from "./types";
import VirtualWeek from "../resources/VirtualWeek";
import Project from "../resources/Project";
import Location from "../resources/Location";
import { compareDateOrder } from "../utils/date";
import { scaleOrdinal, schemeCategory10 } from "d3";
import Semester from "../resources/Semester";

export const fetchVirtualWeeks = (
  locationId: number,
  dispatch: (action: Action) => void,
  setVirtualWeeks: (vws: VirtualWeek[]) => void
): void => {
  fetch(`${VirtualWeek.url}/${locationId}`)
    .then((response) => response.json())
    .then(({ data }) =>
      setVirtualWeeks(data.map((vw: VirtualWeek) => new VirtualWeek(vw)))
    )
    .catch((error) =>
      dispatch({
        type: AdminAction.Error,
        payload: { error },
        meta: "VIRTUAL_WEEKS_FETCH",
      })
    );
};

export const fetchDefaultLocation = (
  dispatch: (action: Action) => void,
  setDefaultLocationId: (id: number) => void
): void => {
  fetch(`${Location.url}/default`)
    .then((response) => response.json())
    .then(({ data }) => setDefaultLocationId(data.id))
    .catch((error) =>
      dispatch({
        type: AdminAction.Error,
        payload: { error },
        meta: "DEFAULT_LOCATION_FETCH",
      })
    );
};

export const fetchCurrentSemester = (
  dispatch: (action: Action) => void,
  setSemester: (s: Semester) => void
): void => {
  fetch(`${Semester.url}/current`)
    .then((response) => response.json())
    .then(({ data }) => setSemester(new Semester(data)))
    .catch((error) =>
      dispatch({
        type: AdminAction.Error,
        payload: { error },
        meta: "CURRENT_SEMESTER_FETCH",
      })
    );
};

const addADay = (s: string): string => {
  const d = new Date(s);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toJSON().split("T")[0];
};

const MILLISECONDS_PER_DAY = 8.64e7;
export const millisecondsToDays = (ms: number): number =>
  ms < 0
    ? Math.ceil(ms / MILLISECONDS_PER_DAY)
    : Math.floor(ms / MILLISECONDS_PER_DAY);

export const daysInInterval = (start: string, end: string): number => {
  const inclusive = millisecondsToDays(
    new Date(end).valueOf() - new Date(start).valueOf()
  );
  return inclusive + 1 * (inclusive < 0 ? -1 : 1);
};

type ProjectResource = {
  eventBackgroundColor?: string;
  id: string;
  title: string;
  parentId?: string;
};

export const makeResources = (
  projects: Project[],
  locationId: number
): ProjectResource[] => {
  const getColor = scaleOrdinal(schemeCategory10);
  const projectsOfInterest = projects.filter((p) =>
    p.allotments.some((a) => a.locationId === locationId)
  );
  return [
    {
      id: VirtualWeek.resourceId,
      title: "Virtual Weeks",
    },
    {
      id: Location.locationHoursId,
      title: "Daily Location Hours",
    },
    ...projectsOfInterest.map((project) => ({
      id: "" + project.id,
      title: project.title,
      eventBackgroundColor: getColor("" + project.id),
    })),
    ...projectsOfInterest.map((project) => ({
      id: `Allotments${project.id}`,
      title: "Allotments",
      parentId: project.id,
      eventBackgroundColor: getColor("" + project.id),
    })),
    {
      id: VirtualWeek.hoursRemainingId,
      title: "Hours Remaining",
      eventBackgroundColor: "grey",
    },
  ];
};

type Allotment = {
  start: string;
  end: string;
  hours: number;
};

export const makeAllotmentSummaryEvent = (
  p: Project,
  first: Allotment,
  last: Allotment,
  total: number
): {} => ({
  id: `allotmentTotal${p.id}`,
  start: first.start,
  end: addADay(last.end),
  resourceId: p.id,
  allDay: true,
  title: `${p.title.replace("Project", "")} - Total Hours: ${total}`,
});

export const makeAllotmentEventMap = (p: Project) => (
  a: Allotment,
  index: number
): {} => ({
  ...a,
  end: addADay(a.end),
  id: `allotment${p.id}-${index}`,
  resourceId: `Allotments${p.id}`,
  allDay: true,
  title: "" + a.hours,
});

export const getFirstLastAndTotalFromAllotments = (
  [first, last, total]: [Allotment, Allotment, number],
  allot: Allotment
): [Allotment, Allotment, number] => {
  if (!first.start || !last.start) return [allot, allot, allot.hours];
  return [
    compareDateOrder(allot.start, first.start) ? allot : first,
    compareDateOrder(last.start, allot.start) ? allot : last,
    total + allot.hours,
  ];
};

export const makeAllotments = (projects: Project[], locationId: number): {}[] =>
  projects.reduce((allots, p) => {
    const ofInterest = p.allotments.filter((a) => a.locationId === locationId);
    if (!ofInterest.length) return allots;
    const [
      first,
      last,
      total,
    ] = ofInterest.reduce(getFirstLastAndTotalFromAllotments, [{}, {}, 0] as [
      Allotment,
      Allotment,
      number
    ]);
    allots.push(makeAllotmentSummaryEvent(p, first, last, total));
    allots.push(...ofInterest.map(makeAllotmentEventMap(p)));
    return allots;
  }, [] as {}[]);

export const makeDailyHours = (location: Location): {}[] => {
  return location.hours.map((dailyHours) => ({
    id: `dh${dailyHours.id}`,
    start: dailyHours.date,
    allDay: true,
    title: "" + dailyHours.hours,
    resourceId: Location.locationHoursId,
  }));
};

export const processVirtualWeeks = (
  virtualWeeks: VirtualWeek[],
  locationId: number
): {}[] =>
  virtualWeeks
    .filter((vw) => vw.locationId === locationId)
    .map((vw) => ({
      ...vw,
      end: addADay(vw.end),
      id: `vw${vw.id}`,
      resourceId: VirtualWeek.resourceId,
      allDay: true,
      title: `${vw.locationHours}`,
    }));

export const processVirtualWeeksAsHoursRemaining = (
  virtualWeeks: VirtualWeek[],
  locationId: number
): {}[] =>
  virtualWeeks
    .filter((vw) => vw.locationId === locationId)
    .map((vw) => ({
      ...vw,
      end: addADay(vw.end),
      id: `hr${vw.id}`,
      resourceId: VirtualWeek.hoursRemainingId,
      allDay: true,
      title: `${vw.locationHours - vw.projectHours}`,
    }));

const RESOURCE_COLUMN_TEXT_CLASSNAME = "fc-datagrid-cell-main";

export const resourceClickHandler = (
  id: string,
  title: string
): ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null => (
  event
): void => {
  if (
    (event.target as HTMLElement).classList.contains(
      RESOURCE_COLUMN_TEXT_CLASSNAME
    )
  ) {
    window.alert(`ID: ${id}, TITLE: ${title}`);
  }
};
