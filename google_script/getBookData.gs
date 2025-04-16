function getData(title, author, field) {
  // title,subtitle,editions,author_key,author_name,cover_i,number_of_pages_median,editions.isbn,description
  // https://github.com/internetarchive/openlibrary/blob/master/openlibrary/solr/solr_types.py
  if (!title) return '';

  const query = `${title} ${author || ''}`;
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=title,author_name,${field}`;

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
