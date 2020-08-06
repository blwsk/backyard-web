query {
  allItems {
    data {
      url
    }
  }
}

mutation {
  createItem(data: { url: "https://www.allencheng.com/starting-a-business-around-gpt-3-is-a-bad-idea/" }) {
    url
  }
}