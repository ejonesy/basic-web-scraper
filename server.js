// Dependencies
var express = require("express");
//var mongojs = require("mongojs");
var request = require("request");
var axios = require("axios");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var app = express();
var db = require("./models/index.js");

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/basic-web-scraper");

// Main route
app.get("/", function (req, res) {
    res.send("You bold scraper, you!");
});

// Scrape data from site and place it into the mongodb db
app.get("/scrape", function (req, res) {
    axios.get("https://www.theonion.com/").then(function (response) {
        console.log(response.data);
        var $ = cheerio.load(response.data);

        $("h1.headline").each(function (i, element) {
            var result = {};
            result.image = $(this)
                .children("img")
                .attr("href");
            result.title = $(this)
                .children("a")
                .text();
            result.summary = $(this)
                .parent()
                .next()
                .children("div.excerpt")
                .children()
                .text()
            result.link = $(this)
                .children("a")
                .attr("href");
            console.log(result);
            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                    res.redirect("/")
                })
                .catch(function (err) {
                    return res.json(err);
                });
        });

        // $(".title").each(function(i, element) {
        //     var title = $(element).children("a").text();
        //     var summary = $(element).children("a").text();
        //     var link = $(element).children("a").attr("href");
        //     if (title && link) {
        //     db.scrapedData.insert({
        //         title: title,
        //         summary: summary,
        //         link: link
        //         },
        //         function(err, inserted) {
        //             if (err) {
        //             console.log(err);
        //             }
        //             else {
        //             console.log(inserted);
        //             }
        //         });
        //     }
        // });
    });

    res.send("Scrape Complete");
});

// Show all scraped articles.
app.get("/all", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {

            res.json(err)
        });
});

// Add comments to articles
app.post("/articles/:id", function (req, res) {
    db.Comment
        .create(req.body)
        .then(function (dbComment) {
            return db.Article.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { comment: dbComment._id } },
                { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
    //console.log(dbArticle);
});

// Route for grabbing one article with comments
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("comment")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});
// Delete comment
app.get("/deletecommentbyid/:id", function (req, res) {
    console.log(req.params.id);
    db.Comment
        .findByIdAndRemove(req.params.id, function (err, todo) {  
            if (err) {
               console.log(err);
            } 
            else {
                console.log("Comment deleted!")
                res.sendStatus(200);
            }
        
        });
        // .then(function (removed) {
        //     console.log(removed);
        //     res.json(removed);
        // })
        // .catch(function (err) {
        //     res.json(err);
        // });
});

app.listen(3000, function () {
    console.log("App running on port 3000!");
});
