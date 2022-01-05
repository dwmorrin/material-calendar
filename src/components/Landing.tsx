import React, { FC, useEffect } from "react";
import { navigate, Router } from "@reach/router";
import { useAuth } from "./AuthProvider";
import UserRoot from "./UserRoot";
import AdminRoot from "./admin/AdminRoot";

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
      <UserRoot path="/calendar" />
      {isAdmin && <AdminRoot path="/admin" />}
    </Router>
  );
};

export default Landing;
