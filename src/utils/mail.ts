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
interface MailOptions {
  to: string;
  subject: string;
  body: string;
  onError: (error: Error, meta?: unknown) => void;
}

export const sendMailOptions = ({
  to,
  subject,
  body,
  onError,
}: MailOptions): void => sendMail(to, subject, body, onError);
