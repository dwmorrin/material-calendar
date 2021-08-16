export interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const groupTo = (group: { email: string }[]): string =>
  group
    .map(({ email }) => email)
    .filter(String)
    .join();

export const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || "";
