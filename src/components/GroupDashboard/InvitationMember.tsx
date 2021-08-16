import React, { FC } from "react";
import { Grid, ListItem } from "@material-ui/core";
import User from "../../resources/User";
import InvitationThumbs from "./InvitationThumbs";

const InvitationMember: FC<{
  name: { first: string; last: string };
  accepted: boolean;
  rejected: boolean;
}> = ({ name, accepted, rejected }) => (
  <ListItem>
    <Grid container justify="space-between">
      <Grid item>{User.formatName(name)}</Grid>
      <InvitationThumbs accepted={accepted} rejected={rejected} />
    </Grid>
  </ListItem>
);

export default InvitationMember;
