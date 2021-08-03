import React, { FunctionComponent, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import EventIcon from "@material-ui/icons/Event";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { RouteComponentProps } from "@reach/router";
import { useAuth, AuthStatus } from "./AuthProvider";
import User from "../resources/User";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const login = (
  username: string,
  password: string,
  setUser: React.Dispatch<React.SetStateAction<User>>,
  setStatus: React.Dispatch<React.SetStateAction<AuthStatus>>,
  setErrors: React.Dispatch<
    React.SetStateAction<{
      username: boolean;
      password: boolean;
    }>
  >
): void => {
  fetch("/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      if (response.status === 200) return response.json();
      throw response.status;
    })
    .then(({ data, error }) => {
      if (error || !data) throw 500;
      const user = new User(data);
      if (user && user.id) {
        setUser(user);
        setStatus(AuthStatus.authenticated);
      } else {
        setErrors({ username: true, password: false });
      }
    })
    .catch((error) => {
      if ([401, 403].includes(error)) {
        setStatus(AuthStatus.notAuthenticated);
        setErrors({ username: true, password: false });
      } else setStatus(AuthStatus.serverError);
    });
};

const Login: FunctionComponent<RouteComponentProps> = () => {
  const { setUser, setStatus } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    username: false,
    password: false,
  });
  const classes = useStyles();

  const handleSubmit = (submitEvent: React.SyntheticEvent): void => {
    submitEvent.preventDefault();
    login(username, password, setUser, setStatus, setErrors);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <EventIcon />
        </Avatar>
        <Typography component="h1" variant="subtitle1">
          {process.env.REACT_APP_COMPANY_NAME}
        </Typography>
        <Typography component="h1" variant="h5">
          {process.env.REACT_APP_APP_NAME}
        </Typography>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            error={errors.username}
            id="username"
            label={process.env.REACT_APP_USERNAME_LABEL}
            name="username"
            autoComplete="username"
            onChange={({ target }): void => setUsername(target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            error={errors.password}
            name="password"
            label={process.env.REACT_APP_PASSWORD_LABEL}
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={({ target }): void => setPassword(target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href={process.env.REACT_APP_HELP_URL} variant="body2">
                {process.env.REACT_APP_HELP_TEXT}
              </Link>
            </Grid>
            <Grid item>
              <Link href={process.env.REACT_APP_MORE_INFO_URL} variant="body2">
                {process.env.REACT_APP_MORE_INFO_TEXT}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
};
export default Login;
