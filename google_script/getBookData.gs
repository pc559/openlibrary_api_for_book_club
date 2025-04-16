function getData(title, author, field) {
  // title,subtitle,editions,author_key,author_name,cover_i,number_of_pages_median,editions.isbn,description
  // https://github.com/internetarchive/openlibrary/blob/master/openlibrary/solr/solr_types.py
  if (!title) return '';

  const title_query = `title=${encodeURIComponent(title)}`;
  const author_query = `author=${encodeURIComponent(author)}`;
  const query = author ? `${title_query}&${author_query}`: `${title_query}`;
  const url = `https://openlibrary.org/search.json?${query}&fields=title,author_name,${field}`;

  const options = {
    method: "get",
    headers: {
      "Accept": "application/json"
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    if (data.numFound > 0) {
      for (let doc of data.docs) {
        this_title = doc.title
        if (this_title.toLocaleLowerCase()==title.toLocaleLowerCase() && doc[field]) {
          return doc[field];
        }
      }
      return 'No '+field+' found for '+data.docs[0].title+' by '+data.docs[0].author_name;
    } else {
      return 'Not found';
    }
  } catch (e) {
    return 'Unhelpful error sorry';
  }
}
