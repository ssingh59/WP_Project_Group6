
const users = require('./users');
const reservationRoutes = require('./reservation_new');
const reservationData = require('../data/reservation');
const path = require('path');
const usersData = require('../data/users');
//const doctorsList = require('./doctorsDetails');

const constructorMethod = (app) => {
	app.use('/users', users);
	//app.use('/reservation_new', reservationData);
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

	//new appointment
	app.get('/reservation/new/:id', async(req, res) => {
		
		let HospitalList = await reservationData.getHospitalByDoc(req.params.id);
		let docsList = await reservationData.getDoctor(req.params.id);
		let user = req.session.user;
		
		//res.render('reservation_new', { doctorList: doctorList, spList: specialismList.List });
		res.render('reservation_new',{user:user,HospitalList:HospitalList,docsList:docsList});
	});

	app.post('/reservation/new/:id', async (req, res) => {
		let user = req.session.user;
		let userid = user._id;
		let docid = req.params.id;
		let hospName = req.body.hospitals;
		let resvDate = req.body.app_date;
		try {
			let reservation = await reservationData.makereservation(userid, docid, resvDate, hospName);
    		res.redirect('/reservation');
		} catch (e) {
		  res.status(400).render('reservation_new');
		  //res.sendStatus(400);
	
		}
	  });

	   // show all appointments page
		app.get("/reservation", logging, loggedIn, async (req, res) => {
			var reservationList = await reservationData.getReservationList(req.session.user);
			res.render('reservation', { user: req.session.user, reservationList: reservationList });
		});

	//doctors details
	app.get('/doctors', async (req, res) => {
		let HospitalList = await reservationData.getAllHospitals();
		let docsList = await reservationData.getAllDoctors();
		res.render('doctors',{docsList:docsList});
	});

	app.use("*", (req, res) => {
		res.status(404).json({ error: "Not found" });
	  });
};

module.exports = constructorMethod;