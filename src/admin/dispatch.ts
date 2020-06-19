import { AdminAction, Action, AdminState, FormValues } from "./types";
import { ResourceInstance, Resources } from "../resources/types";
import { FormikValues } from "formik";

export const dispatchFile = (
  dispatch: (action: { type: number; payload: {} }) => void
): ((event: React.ChangeEvent<HTMLInputElement>) => void) => (event): void => {
  const errorAlert = (): void =>
    window.alert("Unable to open the selected file.");
  const files = event.target.files;
  if (!files) {
    errorAlert();
    return;
  }
  const reader = new FileReader();
  reader.onerror = errorAlert;
  reader.onload = (): void =>
    dispatch({
      type: AdminAction.OpenedFile,
      payload: { resourceFile: reader.result },
    });
  reader.readAsText(files[0]);
};

export const dispatchOneResource = (
  dispatch: (action: Action) => void,
  state: AdminState,
  updater: (state: AdminState, values: FormValues) => ResourceInstance
) => (values: FormValues, actions: FormikValues): void => {
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
    .then(({ data }) => {
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
      // if (deleting) {
      //   dispatch({ type: AdminAction.CloseDetail });
      // }
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
