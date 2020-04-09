// NOTE this page will not be used if single-sign-on is implemented
import React, { FunctionComponent } from "react";
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

// strings
// TODO these should be moved to an admin configurable store
const companyName = "The Clive Davis Institute of Recorded Music";
const appName = "Booking";
const emailLabel = "NYU NetID";
const passwordLabel = "NetID password";
const helpText = "Need help?";
const helpUrl =
  "https://docs.google.com/a/nyu.edu/forms/d/e/1FAIpQLSd2bv5rnNigUneaSbdRNUuJFRtqMmEMTnrH_-G5eRsKW84CNQ/viewform";
const moreInfoText = "Guide to the studios";
const moreInfoUrl =
  "https://wikis.nyu.edu/pages/viewpage.action?title=home&spaceKey=remuproduction";
// end strings

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

const SignIn: FunctionComponent<RouteComponentProps> = () => {
  const classes = useStyles();

  // TODO this just navigates to /calendar, it should be authenticating the user
  const submitHandler = (submitEvent: { preventDefault: () => void }) => {
    submitEvent.preventDefault();
    navigate("/calendar");
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <EventIcon />
        </Avatar>
        <Typography component="h1" variant="subtitle1">
          {companyName}
        </Typography>
        <Typography component="h1" variant="h5">
          {appName}
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label={emailLabel}
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label={passwordLabel}
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
            onClick={submitHandler}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href={helpUrl} variant="body2">
                {helpText}
              </Link>
            </Grid>
            <Grid item>
              <Link href={moreInfoUrl} variant="body2">
                {moreInfoText}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
};
export default SignIn;
