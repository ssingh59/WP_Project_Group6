const xss = require('xss');
const users = require('./users');
const reservationData = require('../data/reservation');
const hospitalData = require('../data/hospitals');
const path = require('path');
const usersData = require('../data/users');
const doctorData = require('../data/doctors');
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

		if(!req.params.id || req.params.id===undefined){
			throw 'doctor id is required'
		}
		try{
		let HospitalList = await hospitalData.getHospitalByDoc(xss(req.params.id));
		let docsList = await doctorData.getDoctor(xss(req.params.id));
		//res.render('reservation_new', { doctorList: doctorList, spList: specialismList.List });
		res.render('reservation_new',{user:user,HospitalList:HospitalList,docsList:docsList,title:"Book new Appointment"});
	   
	} catch (e) {
		res.status(400).render('reservation_new');
	  }
	});

//new appointment information by user id
	app.post('/reservation/new/:id', async (req, res) => {
		let user = req.session.user;
		let userid = user._id;
		if(!req.params.id || !req.body.hospitals || !req.body.app_date){
			throw 'form data is required.'
		}
		if(req.params.id ===undefined || req.body.hospitals===undefined || req.body.app_date===undefined){
			throw 'form data is required.'
		}
		let docid = xss(req.params.id);
		let hospid = xss(req.body.hospitals);
		let resvDate = xss(req.body.app_date);
		
		try {
			const reservation = await reservationData.makereservation(userid, docid, resvDate, hospid);
			const doctor = await doctorData.getDoctor(docid);
			const hospital = await hospitalData.getHospitalById(hospid);
    		res.render('reservation',{user:user,appointment:reservation, doctor:doctor, hospital:hospital, title:"New Appointment Created."});
		} catch (e) {
		  res.status(400).render('reservation_new');
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
			const doctor = await doctorData.getDoctor(reservation.doctor_id);
			const hospital = await hospitalData.getHospitalById(reservation.hospital_id);
    		res.render('reservation',{user:user,appointment:reservation, doctor:doctor, hospital:hospital, title:"Your appointment date has been changed."});
		} catch (e) {
		  res.status(400).redirect('/reservation');
		}
	  });

	  
	  // render apoointment details after adding notes, id is appointment id
	  app.patch('/reservation/notes/:id', async(req, res) => {

		let user = req.session.user;
		if(!req.params.id || req.params.id===undefined || !req.body.notes || req.body.notes===undefined){
			throw "Appointment id is required."
		}
		let appointmentId = xss(req.params.id);
		let notes = xss(req.body.notes);
		try{
		const updateNotes = await reservationData.updateNotesById(appointmentId,notes);
		res.send(updateNotes);
		}catch (e) {
			res.status(400).redirect('/reservation');
		  }
	});

	 // /reservation/edit/{{appointment._id}}
	  app.get('/reservation/edit/:id', async(req, res) => {
		let user = req.session.user;
		if(!req.params.id || req.params.id===undefined)
		{
			throw 'appointment id is required.'
		}
		try{
		const oldAppointment =  await reservationData.getAppointmentById(xss(req.params.id));
		let docsList = await doctorData.getDoctor(oldAppointment.doctor_id);
		let HospitalList = await hospitalData.getHospitalByDoc(docsList._id);
		res.render('reservation_new',{user:user,HospitalList:HospitalList,docsList:docsList,oldAppointment:oldAppointment,title:"Change Appointment Details"});
	    }catch (e) {
		res.status(400).redirect('/reservation');
	  }
	});

	  //get single reservation based on clicked reservation on list of appointments
	  app.get("/reservation/get/:id",async (req, res) => {
		let user = req.session.user;
		if(!req.params.id || req.params.id===undefined){
			throw 'appointment id is required.'
		}
		try {
			const reservation = await reservationData.getAppointmentById(xss(req.params.id));
			const doctor = await doctorData.getDoctor(reservation.doctor_id);
			const hospital = await hospitalData.getHospitalById(reservation.hospital_id);//by doc id
    		res.render('reservation',{user:user,appointment:reservation, doctor:doctor, hospital:hospital,title:"Appointments Details."});
		} catch (e) {
		  res.status(400).redirect('/reservation');
		}
	});

	 // delete appointment
	 app.get('/reservation/delete/:id', async (req , res) =>{
		let user = req.session.user;
		if(!req.params.id || req.params.id===undefined){
			throw 'appointment id is required to delete.'
		}
		try{
		const deletedAppoint = await reservationData.deleteAppointment(xss(req.params.id));
		res.redirect('/reservation');
		}
		catch(e) {
			res.status(500).redirect('/reservation');
		}
	  });

	
	   // show all appointments page
		app.get("/reservation",async (req, res) => {
			let user = req.session.user;
			
			try{
			const reservationList = await reservationData.getReservationList(user._id);

			res.render('all_reservations', { user: req.session.user, reservationList: reservationList ,title:"All Booked Reservations."});
		}catch(e) {
				res.status(500).redirect('/reservation');
			}
		});

	//doctors details
	app.get('/doctors', async (req, res) => {
		let user = req.session.user;
		try{
		let hospitalList = await hospitalData.getAllHospitals();
		let docsList = await doctorData.getAllDoctors();
		let docSearchList = await doctorData.getAllDoctors();
		res.render('doctors',{docsList:docsList,user:user, hospitalList: hospitalList, docSearchList:docSearchList});
		}
		catch(e) {
			res.status(500).render('/doctors');
		}
	});

	app.get('/search', async (req, res) => {
		let user = req.session.user;
		let hospitalList = await hospitalData.getAllHospitals();
		let docSearchList = await doctorData.getAllDoctors();
		let docsList;
		let hospital;
		const searchValue = req.query.hospital;
		//console.log(req.query.hospital)
		try{
		 hospital = await hospitalData.getHospitalById(req.query.id);
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
		
		res.render('doctors',{docsList:docsList,user:user,hospital:hospital, hospitalList: hospitalList, docSearchList:docSearchList, searchValue:searchValue});

	});

	app.use("*", (req, res) => {
		res.status(404).json({ error: "Not found" });
	  });
};

module.exports = constructorMethod;