// NOTE this page will not be used if single-sign-on is implemented
import React, {
  FunctionComponent,
  useContext,
  useState,
  useEffect,
} from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import EventIcon from "@material-ui/icons/Event";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { navigate, RouteComponentProps } from "@reach/router";
import { AuthContext } from "./AuthContext";
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
  setUser?: React.Dispatch<React.SetStateAction<User>>,
  setErrors?: React.Dispatch<
    React.SetStateAction<{
      username: boolean;
      password: boolean;
    }>
  >
): void => {
  if (!setUser || !setErrors) return;
  // FOR TESTING ONLY, NOT USED IN PRODUCTION
  fetch("/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  })
    .then((response) => response.json())
    .then(({ data, error }) => {
      if (!data) {
        throw new Error(error);
      }
      sessionStorage.setItem("username", data.username);
      setUser(new User(data));
      navigate("/calendar");
    })
    .catch((error) => {
      console.error(error); // TODO handle 500 & 401 responses
      sessionStorage.clear(); //! experimental - double check this is correct
      setErrors({ username: true, password: false });
    });
};

const SignIn: FunctionComponent<RouteComponentProps> = () => {
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({
    username: false,
    password: false,
  });
  const classes = useStyles();

  const handleSubmit = (submitEvent: React.SyntheticEvent): void => {
    submitEvent.preventDefault();
    login(username, setUser, setErrors);
  };

  useEffect(() => {
    const username = sessionStorage.getItem("username");
    if (username) {
      login(username, setUser, setErrors);
    }
  }, [setUser]);

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
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
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
export default SignIn;
