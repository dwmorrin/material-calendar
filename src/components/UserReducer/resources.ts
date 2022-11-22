import { StateHandler } from "./types";

import { missingResource } from "./errorRedirect";
import { ResourceKey } from "../../resources/types";
import { addDays, parseSQLDate } from "../../utils/date";
import Semester from "../../resources/Semester";

export const receivedAllResources: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.resources)
    return missingResource(state, action, "No semester is currently active.");
  if (!Array.isArray(payload?.resources[ResourceKey.Semesters]))
    return missingResource(state, action, "No semester is currently active.");
  const semester = payload.resources[ResourceKey.Semesters][0] as Semester;
  if (!semester)
    return missingResource(state, action, "No semester is currently active.");
  const { start, end } = semester;
  return {
    ...state,
    eventRange: {
      start: parseSQLDate(start),
      end: addDays(parseSQLDate(end), 1),
    },
    resources: { ...state.resources, ...payload?.resources },
    initialResourcesPending: false,
  };
};

export const receivedResource: StateHandler = (state, action) => {
  const { payload, meta } = action;
  const resources = payload?.resources;
  if (!resources) {
    return missingResource(state, action, "no resources in payload");
  }
  const resourceKey = meta as number;
  if (resourceKey === undefined) {
    return missingResource(state, action, "no context given");
  }
  const payloadEventRange = payload?.eventRange;
  const eventRange =
    resourceKey === ResourceKey.Events && payloadEventRange
      ? payloadEventRange
      : state.eventRange;
  return {
    ...state,
    eventRange,
    resources: {
      ...state.resources,
      [resourceKey]: resources[resourceKey],
    },
  };
};
