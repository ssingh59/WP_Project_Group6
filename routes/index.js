const users = require('./users');
const path = require('path');

const constructorMethod = (app) => {
	app.use('/users', users);
	app.get('/changePassword', (req, res) => {
		res.render('changePassword', 
		{
			userID: req.query.id
		  });
	});
	app.get('/signup', (req, res) => {
		res.render('signup');
	});
	app.get('/forgotPassword', (req, res) => {
		res.render('forgotPassword');
	});
	app.get('/login', (req, res) => {
		res.render('login');
	});
	app.use("*", (req, res) => {
		res.status(404).json({ error: "Not found" });
	  });

};

module.exports = constructorMethod;