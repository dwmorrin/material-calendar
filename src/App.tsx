import React from "react";
import "typeface-roboto";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import Calendar from "./Calendar";
import Project from "./Project";

function App() {
  return (
    <Router>
      <SignIn path="/" />
      <Calendar path="/calendar" />
      <Project  path="/project" />
    </Router>
  );
}

export default App;
