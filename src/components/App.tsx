import React from "react";
import "typeface-roboto";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import Calendar from "./Calendar";

function App() {
  return (
    <Router>
      <SignIn path="/" />
      <Calendar path="/calendar" />
    </Router>
  );
}

export default App;
