require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const { isWebUri } = require('valid-url');
const { generate } = require('shortid');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const urlDatabase = [];
let counter = 1;

const jsonParser = bodyParser.json();
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }) , function(req, res) {

  const { url } = req.body;
  console.log("url", url);
  if (!url || !isWebUri(url)) {
    res.send({error: 'invalid url'});
    return;
  }

  const findResult = urlDatabase.find(e => e.original_url === url);
  if(findResult){
    console.log("url exists, fetch it and return it!");
    res.send({
      original_url: findResult.original_url,
      short_url: findResult.id,
    });
    return;
  }

  console.log("url does not exist, create it");
  const newId = counter;
  counter++;

  const newEntry = {
    id: newId,
    original_url: url,
    short_url: newId
  }

  console.log("newEntry", newEntry);
  urlDatabase.push(newEntry);
  console.log("urlDatabase", urlDatabase);
  res.send({
    original_url: url,
    short_url: newId,
  });
  return;
});

app.get('/api/shorturl/:id', function(req, res) {
  const { id } = req.params;
  console.log("inside get ", id);
  console.log("inside get urlDatabase ", urlDatabase);
  const findResult = urlDatabase.find(e => e.id === parseInt(id));
  if(findResult){
    console.log("url found, redirect!");
    res.redirect(findResult.original_url);
    return;
  }
  else{
    console.log("url not found, error!");
    res.send({error: 'invalid url'});
    return;
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});