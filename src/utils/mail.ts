import { Action, CalendarAction } from "../calendar/types";

export const sendMail = (
  to: string,
  subject: string,
  text: string,
  dispatch: (action: Action) => void
): void => {
  const dispatchError = (error: Error, meta?: unknown): void =>
    dispatch({ type: CalendarAction.Error, payload: { error }, meta });
  fetch(`/api/mail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: to,
      subject: subject,
      text: text,
    }),
  })
    .then((response) => response.json())
    .then(({ error, data }) => {
      if (error || !data) return dispatchError(error);
      // Success should be silent
      /* dispatchError(
        new Error("Email success, but no success handler written!")
      ); */
    })
    .catch(dispatchError);
};
