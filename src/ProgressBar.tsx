import React, { FunctionComponent } from "react";
import {
  makeStyles,
  createStyles,
  withStyles,
  Theme
} from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";

const ProgressBarClass = withStyles({
  root: {
    height: 20,
    backgroundColor: "#03fc1c"
  },
  bar: {
    borderRadius: 20,
    backgroundColor: "#fc0303"
  }
})(LinearProgress);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    margin: {
      margin: theme.spacing(1)
    }
  })
);

interface ProgressBarProps {
  value1: number;
  value2: number;
}

const ProgressBar: FunctionComponent<ProgressBarProps> = ({
  value1,
  value2
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <ProgressBarClass
        className={classes.margin}
        variant="determinate"
        color="secondary"
        value={(value1 / (value1 + value2)) * 100}
      />
    </div>
  );
};
export default ProgressBar;
