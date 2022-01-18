import { AdminAction, Action, AdminState } from "./types";
import { ResourceInstance } from "../../resources/types";
import { Resources } from "../../resources/Resources";
import { FormikValues } from "formik";
import { ErrorType } from "../../utils/error";

const filePickerErrorAction = {
  type: AdminAction.Error,
  meta: ErrorType.FILE_PICKER,
};

export const dispatchFile =
  (
    dispatch: (action: Action) => void,
    type = AdminAction.OpenedFile
  ): ((event: React.ChangeEvent<HTMLInputElement>) => void) =>
  (event): void => {
    const { files } = event.target;
    if (!files) {
      return dispatch(filePickerErrorAction);
    }
    if (!files.length) return; // user picked, then cancelled the next picker
    const reader = new FileReader();
    reader.onerror = (): void => dispatch(filePickerErrorAction);
    reader.onload = (): void =>
      dispatch({
        type,
        payload: { resourceFile: reader.result },
      });
    reader.readAsText(files[0]);
    event.target.value = ""; // resets file picker button
  };

/**
 * TODO updating one resource may need to update other resources,
 * e.g. projects affect virtual week allotment visualization
 */
export const dispatchOneResource =
  (
    dispatch: (action: Action) => void,
    state: AdminState,
    updater: (
      state: AdminState,
      values: Record<string, unknown>
    ) => ResourceInstance
  ) =>
  (values: Record<string, unknown>, actions: FormikValues): void => {
    const deleting = values.__delete__;
    const id = state.resourceInstance?.id || "";
    if (deleting && Number(id) < 1)
      return dispatch({ type: AdminAction.CloseDetail });
    const resources = state.resources[state.resourceKey];
    const resource = Resources[state.resourceKey];

    actions.setSubmitting(true);
    dispatch({ type: AdminAction.SubmittingDocument });
    fetch(`${resource.url}/${id}`, {
      method: deleting ? "DELETE" : id ? "PUT" : "POST",
      headers: deleting ? {} : { "Content-Type": "application/json" },
      body: deleting ? null : JSON.stringify(updater(state, values)),
    })
      .then((response) => response.json())
      .then(({ error, data, kind }) => {
        if (error || !data)
          return dispatch({ type: AdminAction.Error, payload: { error } });
        if (!kind)
          dispatch({
            type: AdminAction.ReceivedResource,
            payload: {
              resourceInstance: deleting ? undefined : new resource(data),
              resources: {
                ...state.resources,
                [state.resourceKey]: deleting
                  ? resources.filter((d) => d.id !== id)
                  : id
                  ? resources.map((d) => (d.id !== id ? d : new resource(data)))
                  : resources.concat([new resource(data)]),
              },
            },
            meta: state.resourceKey,
          });
        else if (kind === "UPDATE_ALL") {
          // update all resources (when one resource affects others)
          if (!Array.isArray(data))
            throw new Error(`Expected array with kind ${kind}`);
          const newResources = data.map((d) => new resource(d));
          const instance = newResources.find((d) => d.id === id);
          dispatch({
            type: AdminAction.ReceivedResource,
            payload: {
              resourceInstance: deleting ? undefined : instance,
              resources: {
                ...state.resources,
                [state.resourceKey]: newResources,
              },
            },
            meta: state.resourceKey,
          });
        }
      })
      .catch((error) =>
        dispatch({
          type: AdminAction.Error,
          meta: "SUBMITTING_RESOURCE",
          payload: error,
        })
      )
      .finally(() => {
        actions.setSubmitting(false);
      });
  };
