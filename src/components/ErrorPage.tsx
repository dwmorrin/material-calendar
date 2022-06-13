/**
 * This is a dead end.  It should only appear when the app is broken.
 */

import React, { FC } from "react";
import { Dialog, DialogContent, Typography } from "@material-ui/core";

const ErrorPage: FC<{ open: boolean; error?: Error }> = ({ open, error }) => (
  <Dialog open={open} fullScreen={true}>
    <DialogContent>
      <Typography variant="h3">{"You may be logged out"}</Typography>
      <p>
        Most likely you are not logged in. Try closing this tab and reopening in
        a new tab. This can happen due to authentication timeout, switching WiFi
        networks, or other reasons.
      </p>
      <p>
        <a href={process.env.REACT_APP_HELP_URL}>
          Still need help? Contact tech support here.
        </a>
      </p>
      <p>
        On rare occassion there could be an actual error. This is all we know:
      </p>
      <p>{error?.message || "(Hmm... no human readable message was given!)"}</p>
    </DialogContent>
  </Dialog>
);

export default ErrorPage;
