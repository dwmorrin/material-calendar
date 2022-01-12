import { StateHandler } from "./types";

import { missingResource } from "./errorRedirect";

export const receivedAllResources: StateHandler = (state, { payload }) => ({
  ...state,
  resources: { ...state.resources, ...payload?.resources },
  initialResourcesPending: false,
});

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
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceKey]: resources[resourceKey],
    },
  };
};
