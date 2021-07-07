import React, { FC } from "react";
import { RouteComponentProps } from "@reach/router";

const LoggedOut: FC<RouteComponentProps> = () => (
  <>
    <h1>Logged out</h1>
    <p>Close this browser window.</p>
  </>
);

export default LoggedOut;
