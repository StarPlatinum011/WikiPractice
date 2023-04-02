const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs'); 

const app = express();

//initialize body parser
app.use(bodyParser.urlencoded({extended:true}));

//initialize ejs
app.set('view engine', 'ejs');

//make the use of static file
app.use(express.static('public'));

//db connection 
mongoose.connect('mongodb://127.0.0.1:27017/wikiDB',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//db schema
const articles = new mongoose.Schema({
    title: String,
    content: String
});

//db model
const Article = mongoose.model('articles', articles);

///////////////////////////////////////////////////// Requset targeting all requests////////////////

//updated get all articles
async function getArticles(){
    const article = await Article.find({});
    return article;
}

//updated delete format function 
async function deleteArticles(){
    const article = await Article.deleteMany({});
    return article;
}

//make chain routes for articles 
app.route('/articles')
    .get(function(req, res){ //get all the articles
        //new code 
        getArticles().then(function(foundArticles){
            res.send(foundArticles);
            console.log(foundArticles);
        });
    })
    .post(function(req, res){
        //new model
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });
        newArticle.save();
    })
    .delete(function(req, res){
        deleteArticles();
        res.send('successfully deleted all the documents');
    }); //semicolon to end the chain route 

///////////////////////////////////////////////////// Requset targeting a specific requests////////////////

//chain route for specific article with route parameter
app.route('/articles/:articleTitle')
    .get(function (req,res) {
        // Query execution, use param for parameters and body for dom objects
        Article.findOne({title: req.params.articleTitle})
            .then((foundArticle) =>{
                res.send(foundArticle);
            })
            .catch((err)=>{
                res.send('found some error' + err);

            })
    })
    //update (replace) single article
    .put(async function(req , res){
        let doc = await Article.findOneAndUpdate({title: req.params.articleTitle}, 
        {title: req.body.title, content: req.body.content});
        res.send('File changed: ' + doc);
    })
    .patch(function(req, res) {
        Article.updateOne(
            {title:req.params.articleTitle},
            {$set:req.body}, //delete the passed key value pair passed on the req.body object with $set
        )
        .then( resultArticle =>{
            res.send(resultArticle);
        })
        .catch(error => {
            res.send('this is an error of patch', error);
        })
    })
    .delete( function(req , res){
         Article.deleteMany({title: req.params.articleTitle})
         .then( result =>{
            res.send(result)
         })
         .catch(error => {
            res.send(error);
         })
    });

app.listen('3000', function(){
    console.log('Server daudiyo hai ta...')
});