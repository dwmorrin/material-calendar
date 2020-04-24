import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";

interface ProgressBarProps {
  left: { title: string; value: number; color: string };
  right: { title: string; value: number; color: string };
}

const ProgressBar: FunctionComponent<ProgressBarProps> = ({ left, right }) => {
  const size1 = (left.value / (left.value + right.value)) * 100;
  const size2 = (right.value / (left.value + right.value)) * 100;
  const useStyles = makeStyles({
    container: {
      width: "100%",
      height: "100%"
    },
    border: {
      borderStyle: "solid",
      borderRadius: "20px",
      borderColor: "black",
      height: "100%",
    },
    left: {
      display: "inline-block",
      borderRadius: "20px 0px 0px 20px",
      width: size1 + "%",
      height: "100%",
      backgroundColor: left.color,
    },
    right: {
      display: "inline-block",
      borderRadius: "0px 20px 20px 0px",
      width: size2 + "%",
      height: "100%",
      backgroundColor: right.color,
    },
  });

  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.border}>
        <div className={classes.left}>{left.title}</div>
        <div className={classes.right}>{right.title}</div>
      </div>
    </div>
  );
};
export default ProgressBar;
