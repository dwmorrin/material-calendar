import React, { FC, useEffect } from "react";
import { RouteComponentProps, navigate, Router } from "@reach/router";
import { useAuth } from "./AuthProvider";
import User from "../resources/User";
import Calendar from "./Calendar";
import Dashboard from "./admin/Dashboard";

/**
 * Redirect user to the appropriate page
 */
const Landing: FC<RouteComponentProps> = () => {
  const { user } = useAuth();
  useEffect(() => {
    if (User.isAdmin(user)) navigate("/admin");
    else navigate("/calendar");
  }, [user]);
  return (
    <Router>
      <Calendar path="/calendar" />
      {User.isAdmin(user) && <Dashboard path="/admin" />}
    </Router>
  );
};

export default Landing;
