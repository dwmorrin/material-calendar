# Form templating

## `<FormFields>` templates

**(see `/src/components/forms`)**

`<ResourceForm>` takes in a `<FormFields>` template as a parameter.

Each database resource should have its own template components, of type
`<FormFields>` in `/src/components/forms/{{Resource}}.tsx`.

## `FormValues` and updating the `ResourceInstance`

Each database resource should have a file in this directory named
`./{name}.values.ts`.

Each file should contain two exported functions:

1. A function that produces `FormValues` from a `ResourceInstance`.
1. A function that produces a `ResourceInstance` from `FormValues`.

### valuator

The value generating function must map to the form values found in the
`<FormFields>` template. The values may depend on state, so the value
generating function may optionally accept a state object.

### updater

Since the values may not directly map back to the resource to be created or
updated, the second "updater" function operates as the inverse function
to the value generator. It makes sense to keep these two functions in the same
file so you can check that the updater is handling all the values generated.

### data to presentation, then back to data: translation helpers

The primary translation between the resource object and the form is going to be
database IDs and something more human friendly, like titles of resources.
Each file might have a ID => Title function for the valuator, and a Title => ID
function for the updater. Keep all such pairs at the top of the file so it is
clear that we have handled everything. (i.e. we can mentally "cancel out"
all the pairs, so to speak.)

### choices: dummy options

Sometimes we want to apply some option from a field of options to our resource.
The field of options is probably something we have in the external state and
we need to provide those options to the form.

Currently (open to change) the strategy is to provide "dummy values" that we
use in the form but don't apply to the resource in the end.

**Take care to not apply the dummy values to the object submitted to the
database.**

**Do not manipulate the values object. Formik is using this.**

```js
// generalized example
// replace `Resource` with specific class name

// helper functions
const valueHelper = (/* resource, state */) => (/* return form values */);
const inverseValueHelper = (/* values, state */) => (/* return resource properties */);
const optionsGenerator = (/* state */) => (/* return options/dummy values */);

// valuator
// most basic, just copy the current instance:
//   const values = state => ({...state.resourceInstance as Resource})
export const values = (state) => {
  const resource = state.resourceInstance as Resource;
  return {
    ...resource,
    dummyOptions: optionsGenerator(state),
    calculatedValue: valueHelper(resource, state),
  }
}

// updater
export const update = (state, values) => {
  const resource = new Resource(state.resourceInstance as Resource);
  const updated = {
    ...resource,
    ...values,
    calculatedValue: inverseValueHelper(values, state),
  };
  delete updated.dummyOptions;
  return updated;
}
```

## Putting them all together

- `router.ts` contains a lookup function that returns a `valuator`,
  `updater`, and `template` for a given resource key.
- `<DetailsForm>` (`/src/components/admin/DetailsForm.tsx`) calls the router,
  calls the `valuator`, passes in the `template`, and attaches the `updater` to
  the form submission handler.
- `<DetailsForm>` will delete the `id` property from the updated object because
  the database will complain if the new `id` (`""`) is submitted.
