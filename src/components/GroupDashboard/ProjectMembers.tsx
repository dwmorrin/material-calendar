// shows the user the status of the project members: are they available, etc
import React, { FC } from "react";
import { List, ListItem } from "@material-ui/core";
import User from "../../resources/User";

const ProjectMembers: FC<{ projectMembers: User[] }> = ({ projectMembers }) => {
  return (
    <List>
      {projectMembers.map((member) => (
        <ListItem key={member.id}>
          {User.formatName(member.name)}
          {": "}
          {member.hasGroup ? "not available" : "available"}
          {" and "}
          {member.invitations ? "has invitations" : "no invitations"}
        </ListItem>
      ))}
    </List>
  );
};

export default ProjectMembers;
