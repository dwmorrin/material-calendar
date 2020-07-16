/**
 * This is a dead end.  It should only appear when the app is broken.
 */

import React, { FC } from "react";
import { Dialog, Typography } from "@material-ui/core";
import errorSvg from "../error.svg";

const ErrorPage: FC<{ open: boolean; error?: Error }> = ({ open, error }) => (
  <Dialog open={open} fullScreen={true}>
    <Typography variant="h3">{"Oh, no... we've hit an error!"}</Typography>
    <img src={errorSvg} alt="sailing ship run aground" />
    <p>
      <a href={process.env.REACT_APP_HELP_URL}>Contact tech support here.</a>
    </p>
    <p>
      This looks like an issue on our end. The site may be down at this time.
      You will have to refresh the page to try again.
    </p>
    <p>What happened? This is all we know:</p>
    <p>{error?.message || "(Hmm... no human readable message was given!)"}</p>
  </Dialog>
);

export default ErrorPage;
