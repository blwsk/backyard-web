# backyard-web

## FQL queries

### For every Item, create a TextSelectionCount document with that Item's number of TextSelections

```javascript
Map(
  Paginate(Documents(Collection("Item")), { size: 1000 }),
  Lambda(
    "item",
    Create(Collection("TextSelectionCount"), {
      data: {
        item: Var("item"),
        count: Count(Match(Index("clipsByItem"), Var("item"))),
        createdBy: Select(["data", "createdBy"], Get(Var("item"))),
      },
    })
  )
);
```

### Delete all TextSelectionCount documents

```javascript
Foreach(
  Paginate(Documents(Collection("TextSelectionCount")), { size: 1000 }),
  Lambda("item", Delete(Var("item")))
);
```

### Index of Items, sorted by number of clips

```javascript
CreateIndex({
  name: "mostClippedItemsByUser",
  unique: false,
  serialized: true,
  source: Collection("TextSelectionCount"),
  values: [
    {
      field: ["data", "count"],
      reverse: true,
    },
    {
      field: ["data", "item"],
    },
  ],
});
```

### Get clip count for item

```javascript
Let(
  {
    clipCountResults: Paginate(
      Match(
        Index("clipCountByItem"),
        Ref(Collection("Item"), "274021355751473683")
      ),
      { size: 1 }
    ),
  },
  Reduce(
    Lambda(["acc", "item"], Get(Var("item"))),
    null,
    Select("data", Var("clipCountResults"))
  )
);
```

### Invoke getClipCountForItem user-defined function

```javascript
Call(
  Function("getClipCountForItem"),
  Ref(Collection("Item"), "274021355751473683")
);
```

### Get or create TextSelectionCount for item

```javascript
Let(
  {
    clipCountMaybe: Paginate(
      Match(
        Index("clipCountByItem"),
        Ref(Collection("Item"), "277304661699985933")
      ),
      { size: 1 }
    ),
  },
  If(
    IsEmpty(Var("clipCountMaybe")),
    Create(Collection("TextSelectionCount"), {
      data: {
        item: Ref(Collection("Item"), "277304661699985933"),
        count: 0,
      },
    }),
    Reduce(
      Lambda(["acc", "item"], Get(Var("item"))),
      null,
      Select("data", Var("clipCountMaybe"))
    )
  )
);
```

### Increment clip count for item

```javascript
// UDF
Let(
  {
    countForItem: Call(
      Function("getClipCountForItem"),
      Ref(Collection("Item"), "277289690590085644")
    ),
  },
  Update(Select("ref", Var("countForItem")), {
    data: {
      count: Add(Select(["data", "count"], Var("countForItem")), 1),
    },
  })
);

// Invoke
Call(
  Function("incrementClipCountForItem"),
  Ref(Collection("Item"), "277289690590085644")
);
```

### Get most recent SMS Verifier Pin Set for user

Or an empty array if no verifier was found

```javascript
Let(
  {
    verifiersMaybe: Paginate(
      Match(Index("smsVerifiersByUser"), "auth0|5f4a9ce8e9ef5f0067b5aa9f"),
      { size: 1 }
    ),
  },
  If(
    IsEmpty(Var("verifiersMaybe")),
    [],
    Reduce(
      Lambda(["acc", "item"], Var("item")),
      null,
      Select("data", Var("verifiersMaybe"))
    )
  )
);
```
