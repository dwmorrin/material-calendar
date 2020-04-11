import { AllowFunc, ConstraintInput, EventInput } from "./Core";

interface Resource {
  id?: string;
  parentId?: string;
  children?: Resource[];
  title?: string;
  businessHours?: boolean | EventInput | EventInput[];
  eventEditable?: boolean;
  eventStartEditable?: boolean;
  eventDurationEditable?: boolean;
  eventConstraint?: ConstraintInput;
  eventOverlap?: boolean;
  eventAllow?: AllowFunc;
  eventClassName?: string[] | string;
  eventClassNames?: string[] | string;
  eventBackgroundColor?: string;
  eventBorderColor?: string;
  eventTextColor?: string;
  eventColor?: string;
  extendedProps?: {
    [extendedProp: string]: any;
  };
  [otherProp: string]: any;
}

export default Resource;
