import React from "react";
import "typeface-roboto";
import { Router } from "@reach/router";
import AuthProvider from "./AuthContext";
import Calendar from "./Calendar";
import Dashboard from "./admin/Dashboard";
import Landing from "./Landing";
import SignIn from "./SignIn";

const App = (): JSX.Element => {
  return (
    <AuthProvider>
      <SignIn />
      {/* <Router>
        <Landing path="/" />
        <Calendar path="/calendar" />
        <Dashboard path="/admin" />
      </Router> */}
    </AuthProvider>
  );
};

export default App;
