import React, { FunctionComponent } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      "& > * + *": {
        marginTop: theme.spacing(2)
      }
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
      <LinearProgress variant="buffer" value={value1} valueBuffer={value2} />
    </div>
  );
};
export default ProgressBar;
