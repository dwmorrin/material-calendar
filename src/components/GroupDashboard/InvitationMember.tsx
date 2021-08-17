import React, { FC } from "react";
import { Grid, ListItem } from "@material-ui/core";
import User from "../../resources/User";
import InvitationThumbs from "./InvitationThumbs";

const InvitationMember: FC<{
  name: string | { first: string; last: string };
  accepted: boolean;
  rejected: boolean;
}> = ({ name, accepted, rejected }) => (
  <ListItem>
    <Grid container justify="space-between">
      <Grid item xs={10}>
        {typeof name === "string" ? name : User.formatName(name)}
      </Grid>
      <Grid item xs={2}>
        <InvitationThumbs accepted={accepted} rejected={rejected} />
      </Grid>
    </Grid>
  </ListItem>
);

export default InvitationMember;
