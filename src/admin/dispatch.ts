import { AdminAction, Action, AdminState, FormValues } from "./types";
import { ResourceInstance } from "../resources/types";
import { Resources } from "../resources/Resources";
import { FormikValues } from "formik";
import { ErrorType } from "../utils/error";

const filePickerErrorAction = {
  type: AdminAction.Error,
  meta: ErrorType.FILE_PICKER,
};

export const dispatchFile =
  (
    dispatch: (action: Action) => void
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
        type: AdminAction.OpenedFile,
        payload: { resourceFile: reader.result },
      });
    reader.readAsText(files[0]);
    event.target.value = ""; // resets file picker button
  };

export const dispatchOneResource =
  (
    dispatch: (action: Action) => void,
    state: AdminState,
    updater: (state: AdminState, values: FormValues) => ResourceInstance
  ) =>
  (values: FormValues, actions: FormikValues): void => {
    const deleting = values.__delete__;
    const id = state.resourceInstance?.id || "";
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
      .then(({ error, data }) => {
        if (error || !data)
          return dispatch({ type: AdminAction.Error, payload: { error } });
        dispatch({
          type: AdminAction.ReceivedResource,
          payload: {
            detailIsOpen: false,
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
      })
      .catch((error) =>
        dispatch({
          type: AdminAction.Error,
          meta: "SUBMITTING_RESOURCE",
          payload: error,
        })
      )
      .finally(() => {
        // cancel any loading indicators, etc
        actions.setSubmitting(false);
        dispatch({ type: AdminAction.SubmittingDocumentEnd });
      });
  };
