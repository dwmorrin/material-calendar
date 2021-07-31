export const sendMail = (
  to: string,
  subject: string,
  text: string,
  dispatchError: (error: Error, meta?: unknown) => void
): void => {
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

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
  onError: (error: Error, meta?: unknown) => void;
}

export const sendMailOptions = ({ to, subject, text, onError }: Mail): void =>
  sendMail(to, subject, text, onError);
