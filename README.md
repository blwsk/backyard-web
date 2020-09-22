# backyard-web

## FQL queries

### For every Item, create a TextSelectionCount document with that Item's number of TextSelections

```
Map(
  Paginate(Documents(Collection("Item")), { size: 1000 }),
  Lambda("item",
    Create(Collection("TextSelectionCount"), {
      data: {
        item: Var("item"),
        count: Count(Match(Index("clipsByItem"), Var("item")))
      }
    })
  )
)
```

### Items, sorted by number of clips

```
CreateIndex({
  name: "mostClippedItemsByUser",
  unique: false,
  serialized: true,
  source: Collection("TextSelectionCount"),
  values: [
    {
      field: ["data", "count"],
      reverse: true
    },
    {
      field: ["data", "item"]
    }
  ]
})
```
