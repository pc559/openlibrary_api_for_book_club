function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📚 Book Tools')
    .addItem('🔄 Refresh Cache', 'refreshBookData')
    .addToUi();
}

function refreshBookData() {
  const props = PropertiesService.getScriptProperties();
  props.deleteAllProperties();
  SpreadsheetApp.getUi().alert('Book data cache has been cleared 🧼');
}

function getData(title, author, field) {
  // title,subtitle,editions,author_key,author_name,cover_i,number_of_pages_median,editions.isbn,description,first_sentence,publish_year
  // https://github.com/internetarchive/openlibrary/blob/master/openlibrary/solr/solr_types.py
  if (!title) return '';

  const props = PropertiesService.getScriptProperties();
  const cacheKey = `getData-${title}-${author}-${field}`;
  const cached = props.getProperty(cacheKey);
  if (cached) return cached;

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

  let return_val = ''
  try {
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    if (data.numFound > 0) {
      return_val = '' // `No ${field} found for ${data.docs[0].title} by ${data.docs[0].author_name}`;
      for (let doc of data.docs) {
        const thisTitle = doc.title;
        if (thisTitle.toLowerCase() === title.toLowerCase() && doc[field]) {
          return_val = Array.isArray(doc[field]) ? doc[field][0] : doc[field];
          break;
        }
      }
    } else {
      return_val = '' // `No results for ${title} ${author}`;
    }
  } catch (e) {
    return_val = 'Unhelpful error sorry';
  }
  props.setProperty(cacheKey, String(return_val));  // For caching
  return return_val;
}

function bookcover(title, author) {
  if (!title) return "Missing title";

  const olid = getData(title, author, 'cover_edition_key');

  if (typeof olid === 'string' && olid.includes("OL")) {
    return `https://covers.openlibrary.org/b/olid/${olid}-S.jpg`;
  } else {
    return "No cover found";
  }
}
