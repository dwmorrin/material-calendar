import React, { FC, useEffect } from "react";
import { navigate, Router } from "@reach/router";
import { useAuth } from "./AuthProvider";
import Calendar from "./Calendar";
import Dashboard from "./admin/Dashboard";

/**
 * Redirect user to the appropriate page
 */
const Landing: FC = () => {
  const { isAdmin, lastLocation, setLastLocation } = useAuth();

  useEffect(() => {
    if (lastLocation === "/") {
      const destination = isAdmin ? "/admin" : "/calendar";
      setLastLocation(destination);
      navigate(destination);
    } else navigate(lastLocation);
  }, [isAdmin, lastLocation, setLastLocation]);

  return (
    <Router>
      <Calendar path="/calendar" />
      {isAdmin && <Dashboard path="/admin" />}
    </Router>
  );
};

export default Landing;
