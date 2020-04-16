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

function createNestedList(
  parent: string,
  pageContents: { id: string; parentId: string; title: string }[]
): JSX.Element {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions1-content"
        id="additional-actions1-header"
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
          {pageContents.map((location) =>
            location.parentId === parent ? (
              <ListItem button key={location.id}>
                <Checkbox
                  size="small"
                  inputProps={{ "aria-label": "checkbox with small size" }}
                />
                <ListItemText primary={location.title} />
              </ListItem>
            ) : (
              void 0
            )
          )}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}
function createStandardList(
  pageContents: { id: string; parentId: string; title: string }[]
): JSX.Element {
  return (
    <List>
      {pageContents.map((item) => (
        <ListItem button key={item.id}>
          <ListItemText primary={item.title} />
        </ListItem>
      ))}
    </List>
  );
}

interface StudioPanelProps {
  pageContents: { id: string; parentId: string; title: string }[];
  panelType: "checkboxes" | "buttons";
}
const StudioPanel: FunctionComponent<StudioPanelProps> = ({ pageContents }) => {
  const parents = [...new Set(pageContents.map((items) => items.parentId))];
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {parents.length > 1
        ? parents.map((parent) => {
            return pageContents.filter((obj) => obj.parentId === parent)
              .length > 1
              ? createNestedList(parent, pageContents)
              : createStandardList(
                  pageContents.filter((obj) => obj.parentId === parent)
                );
          })
        : createStandardList(pageContents)}
    </div>
  );
};
export default StudioPanel;
