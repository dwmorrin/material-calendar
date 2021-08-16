import React, { FC } from "react";
import { Grid } from "@material-ui/core";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbsUpDownIcon from "@material-ui/icons/ThumbsUpDown";

const InvitationThumbs: FC<{ accepted: boolean; rejected: boolean }> = ({
  accepted,
  rejected,
}) => (
  <Grid item>
    {accepted ? (
      <ThumbUpIcon htmlColor="green" />
    ) : rejected ? (
      <ThumbDownIcon htmlColor="red" />
    ) : (
      <ThumbsUpDownIcon htmlColor="black" />
    )}
  </Grid>
);

export default InvitationThumbs;
