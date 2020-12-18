---
---
/*globals lunr: true */

$(function() {
  var posts;
  var index = lunr(function () {
    this.field('id');
    this.field('title', { boost: 10 });
    this.field('category');
    this.field('content', { boost: 50 });
  });

  function getPost(id) {
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === id) {
        return posts[i];
      }
    }
  };

  function search() {
    var val = $(this).val();
    var results = index.search(val);
    console.log("Got results", results);

    $('.results').empty().show();

    results = results.filter(function(result) {
      return result.score > 0.005
    })

    results.forEach(function(result) {
      var post = getPost(result.ref);
      console.log("Post?", post);
      $('.results')
            .append('<a href="{{site.baseurl}}' + post.id + '" class="result"><h2>' + post.title + '</h2><p>' + post.intro + '</p></a>');
    });

    if (results.length === 0 &&val.length > 2) {
      $('.results').append('<h2>No results found for ' + val + '</h2>');
    }


    if (results.length === 0 &&val.length <= 2) {
      $('.results').hide();
    }
  }


  var fetch = $.getJSON('{{ "/index.json" | prepend: site.baseurl }}');

  fetch.fail(function(error) {
    console.log("Error getting index", error);
  });

  fetch.done(function(data) {
    posts = data;
    posts.forEach(function(post) {
      index.add(post);
    });

    $('#search').keyup(search)
  });
});
