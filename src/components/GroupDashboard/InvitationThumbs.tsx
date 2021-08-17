import React, { FC } from "react";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbsUpDownIcon from "@material-ui/icons/ThumbsUpDown";

const InvitationThumbs: FC<{ accepted: boolean; rejected: boolean }> = ({
  accepted,
  rejected,
}) =>
  accepted ? (
    <ThumbUpIcon htmlColor="green" />
  ) : rejected ? (
    <ThumbDownIcon htmlColor="red" />
  ) : (
    <ThumbsUpDownIcon htmlColor="black" />
  );

export default InvitationThumbs;
