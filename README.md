# Material Calendar

Calendar client app using
[React](https://reactjs.org/),
[Material UI](https://material-ui.com/),
and [FullCalender](https://fullcalendar.io/).

A complementary backend repo,
[Material Calendar API](https://github.com/dwmorrin/material-calendar-api),
uses Express & MySQL to serve and store the calendar data.

## config

`npm start` to serve this repo from localhost:3000.

Uses a `.env.local` file to fill in any variables on `process.env`.

Needs a backend API to function.
[See this repo.](https://github.com/dwmorrin/material-calendar-api)

## notes

This is _not_ a general purpose calendar client (yet).
Curently it is an upgrade module for an existing bespoke calendar app.
The current goal of the project is to adapt to the legacy app where needed, thus
some bits of the repo may be completely irrelevant for a general calendar app.

The long term goal is to generalize the client app and provide enough admin
controls in the web app to let end users tailor the app to their needs.
