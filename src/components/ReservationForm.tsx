import React, { FunctionComponent, useState } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  Button,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Select from "./Select";
import UserGroup from "../resources/UserGroup";
import { Formik } from "formik";
import EquipmentForm from "./EquipmentForm";
import QuantityList from "./QuantityList";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import {
  initialValidationSchema,
  makeInitialValues,
  makeRequiredGuests,
  useStyles,
  submitHandler,
  transition,
} from "../calendar/reservationForm";

const ReservationForm: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const [validationSchema, setValidationSchema] = useState(
    initialValidationSchema
  );
  const requireGuests = makeRequiredGuests(setValidationSchema);
  const [equipmentFormIsOpen, setEquipmentFormIsOpen] = useState(false);
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const classes = useStyles();

  return (
    <Dialog
      fullScreen
      open={state.reservationFormIsOpen}
      TransitionComponent={transition}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseReservationForm })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Make Reservation</Typography>
      </Toolbar>

      <DialogContent>
        <Formik
          initialValues={makeInitialValues(state)}
          onSubmit={submitHandler}
          validationSchema={validationSchema}
        >
          {({
            values,
            touched,
            errors,
            isSubmitting,
            handleChange,
            setFieldValue,
            handleBlur,
            handleSubmit,
          }): unknown => (
            <form onSubmit={handleSubmit}>
              <div className={classes.list}>
                <div style={{ paddingTop: 16 }}>Project:</div>
                <div style={{ paddingLeft: 5 }}>
                  <Select
                    dispatch={dispatch}
                    state={state}
                    value={(values.project as Project).id}
                    selectName="projects"
                    selectId="projectsDropDown"
                    contents={projects}
                    onChange={(event): void => {
                      setFieldValue(
                        "project",
                        projects.find((p) => p.id === +event?.target.value)
                      );
                    }}
                  ></Select>
                </div>
              </div>
              <div className={classes.list}>
                {"Group: "}
                <div className={classes.paddingLeftTen}>
                  {(
                    groups.find(
                      (group) =>
                        group.projectId === (values.project as Project).id
                    ) || new UserGroup()
                  ).members.map(({ username, name }) => (
                    <span key={username}>
                      {`${name.first} ${name.last}`}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
              <br />
              <TextField
                label="Brief Description of what you will be doing"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                helperText={
                  errors.description &&
                  touched.description &&
                  errors.description
                }
                fullWidth
                variant="filled"
              />
              <br />
              <br />
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Do you need to use the Live Room?
                </FormLabel>
                <RadioGroup
                  aria-label="liveRoom"
                  name="liveRoom"
                  value={values.liveRoom}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              <br />
              <TextField
                label="Phone Number"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                helperText={errors.phone && touched.phone && errors.phone}
                fullWidth
                variant="filled"
              />
              <br />
              <br />
              <FormControl component="fieldset">
                <FormLabel component="legend">Do you have guests?</FormLabel>
                <RadioGroup
                  aria-label="guestsToggle"
                  name="hasGuests"
                  value={values.hasGuests}
                  onChange={(event: React.ChangeEvent<{}>, value): void => {
                    setFieldValue("hasGuests", value);
                    requireGuests(event);
                  }}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              <br />
              {values.hasGuests === "yes" && (
                <TextField
                  label="Guest Names"
                  name="guests"
                  value={values.guests}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  helperText={errors.guests && touched.guests && errors.guests}
                  fullWidth
                  variant="filled"
                />
              )}
              <br />
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Do you have any notes about your reservation for the Tech
                  Staff?
                </FormLabel>
                <RadioGroup
                  aria-label="notes"
                  name="hasNotes"
                  value={values.hasNotes}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              {values.hasNotes === "yes" && (
                <TextField
                  id="notes"
                  label="Notes"
                  fullWidth
                  multiline
                  rows={8}
                  variant="filled"
                />
              )}
              <br />
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Would you like to reserve any equipment now?
                </FormLabel>
                <RadioGroup
                  aria-label="equipment"
                  name="hasEquipment"
                  value={values.hasEquipment}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              {values.hasEquipment === "yes" && (
                <div>
                  <br />
                  <QuantityList
                    selectedEquipment={
                      values.equipment as { [k: string]: number }
                    }
                  />
                  <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    style={{ backgroundColor: "Yellow", color: "black" }}
                    disabled={isSubmitting}
                    onClick={(): void => setEquipmentFormIsOpen(true)}
                  >
                    Add Equipment
                  </Button>
                </div>
              )}
              <br />
              <br />
              <Button
                type="submit"
                size="small"
                variant="contained"
                disableElevation
                style={{ backgroundColor: "Green", color: "white" }}
                disabled={isSubmitting}
              >
                Confirm Reservation
              </Button>
              <EquipmentForm
                open={equipmentFormIsOpen}
                setOpen={setEquipmentFormIsOpen}
                selectedEquipment={values.equipment as { [k: string]: number }}
                filters={values.filters as {}}
                currentCategory={values.currentCategory as string}
                setFieldValue={setFieldValue}
              />
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationForm;
