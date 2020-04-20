import React from "react";
import "typeface-roboto";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import Calendar from "./Calendar";
import Projects from "./Projects";

function App(): JSX.Element {
  return (
    <Router>
      <SignIn path="/" />
      <Calendar path="/calendar" />
      <Projects path="/projects" />
    </Router>
  );
}

export default App;
