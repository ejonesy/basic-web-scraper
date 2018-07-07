// Display all scraped articles
$.getJSON("/all", function(data) {
    for (var i = 0; i < data.length; i++) {
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].summary + "<br />" + data[i].link + "</p>" + "<br />" + data[i].comment);
    }
});
  
// Click on any article to bring up comment box
$(document).on("click", "p", function() {
    $("#comment").empty();
    //$("#results").empty();
    var thisId = $(this).attr("data-id");

    $.ajax({
    method: "GET",
    url: "/articles/" + thisId
    })
    .then(function(data) {
        console.log(data);
        $("#comment").append("<h2>" + data.title + "</h2>");
        $("#comment").append("<input id='titleinput' name='title' >");
        $("#comment").append("<textarea id='bodyinput' name='body'></textarea>");
        $("#comment").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");

        if (data.comment) {
        $("#titleinput").val(data.comment.title);
        $("#bodyinput").val(data.comment.body);
        }
    });
});

// To save a comment with its article
$(document).on("click", "#savecomment", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title: $("#titleinput").val(),
            body: $("#bodyinput").val()
        }
    })
    // Empties the comment area once comment has been saved
    .then(function(data) {
        console.log(data);
        $("#comment").empty();
    });
    $("#titleinput").val("");
    $("#bodyinput").val("");
});
