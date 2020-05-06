const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");

const configRoutes = require('./routes');
const exphbs = require('express-handlebars');

app.use('/public', static);
app.use(express.json());app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  key:"AuthCookie",
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));



app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
	console.log("We've now got a server!");
	console.log('Your routes will be running on http://localhost:3000');
});