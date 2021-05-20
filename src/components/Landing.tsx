import React, { FC, useContext, useEffect } from "react";
import { RouteComponentProps, navigate } from "@reach/router";
import { AuthContext } from "./AuthContext";
import User from "../resources/User";

/**
 * This landing page assumes the app is protected behind a server handling authentication.
 * Replace this component with a login page if you want to do your own authentication.
 * The assumption is that a backend API exists where this page just needs to fetch from /login
 * and magically all the user details will be returned to the app.
 *
 * This page should just display animation and/or a "loading" message and then get redirected
 * to a working app page or an error page.
 *
 * @returns Landing page component
 */
const Landing: FC<RouteComponentProps> = () => {
  const { user, setUser } = useContext(AuthContext);
  useEffect(() => {
    if (!user || !setUser) throw new Error("no method to login user available");
    if (user.username) navigate("/calendar");
    else
      fetch("/login")
        .then((response) => response.json())
        .then(({ data, error }) => {
          if (!data) {
            throw new Error(error);
          }
          setUser(new User(data));
          navigate("/calendar");
        })
        .catch((error) => {
          throw new Error(error); // TODO handle 500 & 401 responses
        });
  }, [user, setUser]);
  return <div>Loading...</div>;
};

export default Landing;
