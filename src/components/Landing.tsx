import React, { FC, useEffect } from "react";
import { RouteComponentProps, navigate, Router } from "@reach/router";
import { useAuth } from "./AuthProvider";
import Calendar from "./Calendar";
import Dashboard from "./admin/Dashboard";

/**
 * Redirect user to the appropriate page
 */
const Landing: FC<RouteComponentProps> = () => {
  const { isAdmin } = useAuth();
  useEffect(() => {
    if (isAdmin) navigate("/admin");
    else navigate("/calendar");
  }, [isAdmin]);
  return (
    <Router>
      <Calendar path="/calendar" />
      {isAdmin && <Dashboard path="/admin" />}
    </Router>
  );
};

export default Landing;
