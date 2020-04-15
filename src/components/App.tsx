import React from "react";
import "typeface-roboto";
import { Router } from "@reach/router";
import AuthProvider from "./AuthContext";
import SignIn from "./SignIn";
import Calendar from "./Calendar";

function App(): JSX.Element {
  return (
    <AuthProvider>
      <Router>
        <SignIn path="/" />
        <Calendar path="/calendar" />
      </Router>
    </AuthProvider>
  );
}

export default App;
