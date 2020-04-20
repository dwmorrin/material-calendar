import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const useStyles = makeStyles({
  root: {
    width: "100%"
  }
});

function makeCheckbox(location: {
  id: string;
  parentId: string;
  title: string;
}): JSX.Element {
  return (
    <Checkbox
      size="small"
      inputProps={{ "aria-label": "checkbox with small size" }}
      key={location.id}
    />
  );
}

function createNestedList(
  parent: string,
  drawerContents: { id: string; parentId: string; title: string }[],
  panelType: "checkboxes" | "buttons"
): JSX.Element {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions1-content"
        id="additional-actions1-header"
        onClick={(event): void => event.stopPropagation()}
      >
        <FormControlLabel
          aria-label="Acknowledge"
          onClick={(event): void => event.stopPropagation()}
          onFocus={(event): void => event.stopPropagation()}
          control={<Checkbox />}
          label={parent}
        />
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <List>
          {drawerContents
            .filter((location) => location.parentId === parent)
            .map((location) => (
              <ListItem
                button
                key={location.id}
                onClick={(event): void => event.stopPropagation()}
              >
                {panelType === "checkboxes"
                  ? makeCheckbox(location)
                  : undefined}
                <ListItemText primary={location.title} />
              </ListItem>
            ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

function createStandardList(
  drawerContents: { id: string; parentId: string; title: string }[],
  panelType: "checkboxes" | "buttons"
): JSX.Element {
  return (
    <List>
      {drawerContents.map((item) => (
        <ListItem
          button
          key={item.id}
          onClick={(event): void => event.stopPropagation()}
        >
          {panelType === "checkboxes" ? makeCheckbox(item) : undefined}
          <ListItemText primary={item.title} />
        </ListItem>
      ))}
    </List>
  );
}

interface StudioPanelProps {
  drawerContents: { id: string; parentId: string; title: string }[];
  panelType: "checkboxes" | "buttons";
}
const StudioPanel: FunctionComponent<StudioPanelProps> = ({
  drawerContents,
  panelType
}) => {
  const parents = [...new Set(drawerContents.map((items) => items.parentId))];
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {parents.length > 1
        ? parents.map((parent) => {
            return drawerContents.filter((obj) => obj.parentId === parent)
              .length > 1
              ? createNestedList(parent, drawerContents, panelType)
              : createStandardList(
                  drawerContents.filter((obj) => obj.parentId === parent),
                  panelType
                );
          })
        : createStandardList(drawerContents, panelType)}
    </div>
  );
};
export default StudioPanel;
