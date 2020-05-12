
const users = require('./users');
const reservationData = require('../data/reservation');
const path = require('path');
const usersData = require('../data/users');
var doctorData = require('../data/doctors')
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
		let user = req.session.user;
		let HospitalList = await reservationData.getHospitalByDoc(req.params.id);
		let docsList = await reservationData.getDoctor(req.params.id);
		
		
		//res.render('reservation_new', { doctorList: doctorList, spList: specialismList.List });
		res.render('reservation_new',{user:user,HospitalList:HospitalList,docsList:docsList});
	});

//new appointment information by user id
	app.post('/reservation/new/:id', async (req, res) => {
		let user = req.session.user;
		let userid = user._id;
		let docid = req.params.id;
		let hospid = req.body.hospitals;
		let resvDate = req.body.app_date;
		try {
			const reservation = await reservationData.makereservation(userid, docid, resvDate, hospid);
			const doctor = await reservationData.getDoctor(docid);
			const hospital = await reservationData.getHospitalById(hospid);
    		res.render('reservation',{user:user,appointment:reservation, doctor:doctor, hospital:hospital});
		} catch (e) {
		  res.status(400).render('reservation_new');
		  //res.sendStatus(400);
	
		}
	  });

	 // /reservation/edit/{{appointment._id}}
	  app.get('/reservation/edit/:id', async(req, res) => {
		let user = req.session.user;
		const oldAppointment =  await reservationData.getAppointmentById(req.params.id)
		let docsList = await reservationData.getDoctor(oldAppointment.doctor_id);
		let HospitalList = await reservationData.getHospitalByDoc(docsList._id);
		res.render('reservation_new',{user:user,HospitalList:HospitalList,docsList:docsList,oldAppointment:oldAppointment,title:"Change Appointment Details"});
	});

	  //get single reservation based on clicked reservation on list of appointments
	  app.get("/reservation/get/:id",async (req, res) => {
		let user = req.session.user;
		try {
			const reservation = await reservationData.getAppointmentById(req.params.id);
			const doctor = await reservationData.getDoctor(reservation.doctor_id);
			const hospital = await reservationData.getHospitalById(reservation.hospital_id);
    		res.render('reservation',{user:user,appointment:reservation, doctor:doctor, hospital:hospital});
		} catch (e) {
		  res.status(400).render('reservation_new');
		  //res.sendStatus(400);
		}
	});

	 // delete appointment
	 app.get('/reservation/delete/:id', async (req , res) =>{
		const deletedAppoint = await reservationData.deleteAppointment(req.params.id);
		res.redirect('/reservation');
	  });

	
	   // show all appointments page
		app.get("/reservation",async (req, res) => {
			let user = req.session.user;
			const reservationList = await reservationData.getReservationList(user._id);

			res.render('all_reservations', { user: req.session.user, reservationList: reservationList });
		});

	//doctors details
	app.get('/doctors', async (req, res) => {
		let user = req.session.user;
		let hospitalList = await reservationData.getAllHospitals();
		let docsList = await reservationData.getAllDoctors();
		let docSearchList = await reservationData.getAllDoctors();
		res.render('doctors',{docsList:docsList,user:user, hospitalList: hospitalList, docSearchList:docSearchList});
	});

	app.get('/search', async (req, res) => {
		let user = req.session.user;
		let hospitalList = await reservationData.getAllHospitals();
		let docSearchList = await reservationData.getAllDoctors();
		var docsList;
		let hospital;
		const searchValue = req.query.hospital;
		//console.log(req.query.hospital)
		try{
		 hospital = await reservationData.getHospitalById(req.query.id);
		}
		catch(err){
				//console.log(err);
		}
		if(hospital){
		 docsList = await doctorData.getDoctorsByHospital(hospital);
		}
		else{
			docsList = await doctorData.getDoctors(req.query.id);
		}
		
		res.render('doctors',{docsList:docsList,user:user, hospitalList: hospitalList, docSearchList:docSearchList, searchValue:searchValue});
	});

	app.use("*", (req, res) => {
		res.status(404).json({ error: "Not found" });
	  });
};

module.exports = constructorMethod;