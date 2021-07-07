import React, { FC, useContext, useEffect } from "react";
import { RouteComponentProps, navigate } from "@reach/router";
import { AuthContext } from "./AuthContext";
import User from "../resources/User";
import { useState } from "react";
import LoggedOut from "./LoggedOut";

/**
 * This landing page assumes the app is protected behind a server handling authentication.
 * Replace this component with a login page if you want to do your own authentication.
 * The assumption is that a backend API exists where this page just needs to fetch from /login
 * and magically all the user details will be returned to the app.
 *
 * This page should just display animation and/or a "loading" message and then get redirected
 * to a working app page.
 * If the API does not respond with success, the component assumes that the
 * user is authenticated but not registered to use the app (user does not exist in the app database).
 *
 * @returns Landing page component
 */
const Landing: FC<RouteComponentProps> = () => {
  const { user, setUser, loggedOut } = useContext(AuthContext);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!user || !setUser) throw new Error("no method to login user available");
    if (user.username) navigate("/calendar");
    else if (!loggedOut)
      fetch("/login")
        .then((response) => response.json())
        .then(({ data, error }) => {
          if (error || !data) return setUnauthorized(true);
          setUser(new User(data));
          navigate("/calendar");
        })
        .catch((error) => {
          throw new Error(error); // TODO handle 500 & 401 responses
        });
  }, [user, setUser, loggedOut]);

  return unauthorized ? (
    <>
      <h1>Are you registered?</h1>
      <p>We were unable to find you in our system.</p>
      <a href={process.env.REACT_APP_HELP_URL}>Click here to contact us.</a>
    </>
  ) : loggedOut ? (
    <LoggedOut />
  ) : (
    <>Loading...</>
  );
};

export default Landing;
