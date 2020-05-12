const xss = require('xss');
const users = require('./users');
const reservationData = require('../data/reservation');
const hospitalData = require('../data/hospitals');
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
			userID: xss(req.query.id)
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

	//new appointment with prefilled doctors, user details, dropdown for hopitals
	app.get('/reservation/new/:id', async(req, res) => {
		let user = req.session.user;
		let HospitalList = await hospitalData.getHospitalByDoc(xss(req.params.id));
		let docsList = await doctorData.getDoctor(xss(req.params.id));
		
		
		//res.render('reservation_new', { doctorList: doctorList, spList: specialismList.List });
		res.render('reservation_new',{user:user,HospitalList:HospitalList,docsList:docsList,title:"Book new Appointment"});
	});

//new appointment information by user id
	app.post('/reservation/new/:id', async (req, res) => {
		let user = req.session.user;
		let userid = user._id;
		let docid = xss(req.params.id);
		let hospid = xss(req.body.hospitals);
		let resvDate = xss(req.body.app_date);
		try {
			const reservation = await reservationData.makereservation(userid, docid, resvDate, hospid);
			const doctor = await reservationData.getDoctor(docid);
			const hospital = await reservationData.getHospitalById(hospid);
    		res.render('reservation',{user:user,appointment:reservation, doctor:doctor, hospital:hospital, title:"New Appointment Created."});
		} catch (e) {
		  res.status(400).render('reservation_new');
		  //res.sendStatus(400);
	
		}
	  });

	   //edited apoointment render(by appointment id)
	   app.post('/reservation/edit/:id', async (req, res) => {

		let user = req.session.user;

		let userid = user._id;
		let appointmentId = xss(req.params.id);
		//new date
		let resvDate = xss(req.body.app_date);
		try {
			const reservation = await reservationData.editReservation(appointmentId, resvDate);
			const doctor = await reservationData.getDoctor(reservation.doctor_id);
			const hospital = await reservationData.getHospitalById(reservation.hospital_id);
    		res.render('reservation',{user:user,appointment:reservation, doctor:doctor, hospital:hospital, title:"Your appointment date has been changed."});
		} catch (e) {
		  res.status(400).render('reservation_new');
		  //res.sendStatus(400);
	
		}
	  });

	  
	  // render apoointment details after adding notes, id is appointment id
	  app.patch('/reservation/notes/:id', async(req, res) => {
		let user = req.session.user;
		let appointmentId = xss(req.params.id);
		let notes = req.body.notes;
		const updateNotes = await reservationData.updateNotesById(appointmentId,notes);
		res.send(updateNotes);
	});

	 // /reservation/edit/{{appointment._id}}
	  app.get('/reservation/edit/:id', async(req, res) => {
		let user = req.session.user;
		const oldAppointment =  await reservationData.getAppointmentById(xss(req.params.id));
		let docsList = await reservationData.getDoctor(oldAppointment.doctor_id);
		let HospitalList = await hospitalData.getHospitalByDoc(docsList._id);
		res.render('reservation_new',{user:user,HospitalList:HospitalList,docsList:docsList,oldAppointment:oldAppointment,title:"Change Appointment Details"});
	});

	  //get single reservation based on clicked reservation on list of appointments
	  app.get("/reservation/get/:id",async (req, res) => {
		let user = req.session.user;
		try {
			const reservation = await reservationData.getAppointmentById(xss(req.params.id));
			const doctor = await reservationData.getDoctor(reservation.doctor_id);
			const hospital = await reservationData.getHospitalById(reservation.hospital_id);//by doc id
    		res.render('reservation',{user:user,appointment:reservation, doctor:doctor, hospital:hospital});
		} catch (e) {
		  res.status(400).render('reservation_new');
		  //res.sendStatus(400);
		}
	});

	 // delete appointment
	 app.get('/reservation/delete/:id', async (req , res) =>{
		const deletedAppoint = await reservationData.deleteAppointment(xss(req.params.id));
		res.redirect('/reservation');
	  });

	
	   // show all appointments page
		app.get("/reservation",async (req, res) => {
			let user = req.session.user;
			const reservationList = await reservationData.getReservationList(user._id);

			res.render('all_reservations', { user: req.session.user, reservationList: reservationList ,title:"All Booked Reservations."});
		});

	//doctors details
	app.get('/doctors', async (req, res) => {
		let user = req.session.user;
		let hospitalList = await reservationData.getAllHospitals();
		let docsList = await reservationData.getAllDoctors();
		res.render('doctors',{docsList:docsList,user:user, hospitalList: hospitalList});
	});

	app.get('/search', async (req, res) => {
		let user = req.session.user;
		let hospitalList = await reservationData.getAllHospitals();
		//console.log(req.query.hospital)
		let hospital = await reservationData.getHospitalById(xss(req.query.id));
		let docsList = await doctorData.getDoctorsByHospital(hospital);
		res.render('doctors',{docsList:docsList,user:user, hospitalList: hospitalList});
	});

	app.use("*", (req, res) => {
		res.status(404).json({ error: "Not found" });
	  });
};

module.exports = constructorMethod;