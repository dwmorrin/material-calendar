import React from "react";
import "typeface-roboto";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import Calendar from "./Calendar";
import Projects from "./Projects";
import GearList from "./GearList";

function App() {
  return (
    <Router>
      <SignIn path="/" />
      <Calendar path="/calendar" />
      <Projects path="/projects" />
      <GearList path="/gear" />
    </Router>
  );
}

export default App;
