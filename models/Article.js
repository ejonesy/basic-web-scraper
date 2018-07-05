var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//Each article gets a title, summary, link, and any comments the user adds
var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  summary: {
      type: String,
      required: true
  },
  link: {
    type: String,
    required: true
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
