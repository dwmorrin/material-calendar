import React from "react";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import { Slide, SlideProps } from "@material-ui/core";

export const makeTransition = (
  direction: "left" | "right" | "up" | "down"
): React.ComponentType<SlideProps> => {
  return React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement },
    ref: React.Ref<unknown>
  ) {
    return <Slide direction={direction} ref={ref} {...props} />;
  });
};
