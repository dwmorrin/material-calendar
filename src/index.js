import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";

try {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
} catch (e) {
  // eslint-disable-next-line no-console
  console.log(e);
  // Clear the screen, display the message
  let body = document.body;
  if (!body) {
    body = document.createElement("body");
    document.append(body);
  } else {
    Array.from(body.children).forEach((child) => child.remove());
  }
  const heading = document.createElement("h1");
  heading.textContent = "You are logged out. Try refreshing the page.";
  body.append(heading);
}
