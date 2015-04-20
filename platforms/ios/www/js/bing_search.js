window.bing_search = function(keyword, callback) {
  var encoded, url;
  if (window.bing_acctkey == null) {
    return;
  }
  url = "https://api.datamarket.azure.com/Bing/Search/Image?$format=json&Query='" + keyword + "'";
  encoded = btoa(window.bing_acctkey + ":" + window.bing_acctkey);
  return $.ajax({
    url: url,
    type: 'PUT',
    headers: {
      Authorization: "Basic " + encoded
    },
    dataType: "json",
    success: function(data) {
      return callback(data['d']['results'].map(function(d) {
        return d['MediaUrl'];
      }));
    },
    error: function(xhr, textStatus, errorThrown) {
      return alert("Can't perform Bing search ... " + textStatus);
    }
  });
};