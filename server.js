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
var db = require("./models");
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/basic-web-scraper");

// Main route
app.get("/", function(req, res) {
  res.send("You bold scraper, you!");
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
    request("http://www.echojs.com/", function(error, response, html) {
        console.log(html);
        var $ = cheerio.load(html);

        $(".title").each(function(i, element) {
            var title = $(element).children("a").text();
            var summary = $(element).children("a").text();
            var link = $(element).children("a").attr("href");
            if (title && link) {
            db.scrapedData.insert({
                title: title,
                summary: summary,
                link: link
                },
                function(err, inserted) {
                    if (err) {
                    console.log(err);
                    }
                    else {
                    console.log(inserted);
                    }
                });
            }
        });
    });

    res.send("Scrape Complete");
});

// Show all scraped articles.
app.get("/all", function(req, res) {
    db.scrapedData.find({}, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });
  });

// Add comments to articles
app.post("/articles/:id", function(req, res) {
    db.Comment.create(req.body)
    .then(function(dbComment) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbComment._id }, { new: true });
    })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// Route for grabbing one article with comments
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});
  
app.listen(3000, function() {
console.log("App running on port 3000!");
});
  