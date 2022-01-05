# Record templating

The goal is to map a bunch of database info into formatted output.

The strategy is to use an array of pairs e.g.
`[ ["label1", "value1"], ["label2", "value2"], ... ]`.

We use arrays so we have consistent order. A Map would be nice, but Maps don't
iterate nicely into JSX. Normal object dictionaries lack ordering. Arrays
ensure the template renders in the specified order.

`router.ts` gives back the populating function for a given resource key;
the populating function will give back string values
for a given resource instance.

A call to the router looks like

```js
const values = router(resourceKey)(resourceInstance);
```

## Going further

If the admin users want to configure the formatting online, or add models to
the database dynamically, consider a system to read and write these templates
to and from a database.
