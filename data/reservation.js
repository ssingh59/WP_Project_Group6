const CryptoJS = require("crypto-js");
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const hospitals = mongoCollections.hospitals;
const doctors = mongoCollections.doctors;
const appointments = mongoCollections.appointments;
const { ObjectId } = require('mongodb');
const nodemailer = require("nodemailer");
const user = require("./users");


module.exports = {
    async getDoctor(id) {
        if (!id) throw 'You must provide an id to search for';
        if(typeof id !== 'string' && typeof id !== 'object') throw 'id must be a string or object';
    
        if(typeof id === 'string'){
         id = ObjectId.createFromHexString(id);
        }
       
        const docCollection = await doctors();
        const doc = await docCollection.findOne({ _id: id });
        if (doc === null) throw 'No user with that id';
    //whole doc data
        return doc;
    },
    
    async makereservation(userid, docid, resvDate, hospid) {
        if (userid === undefined || docid === undefined || hospid === undefined) {
            throw 'input is empty';
        }

        /* if (userid.constructor != ObjectID) {
            if (ObjectID.isValid(userid)) {
                userid = new ObjectID(userid);
            }
            else {
                throw 'Id is invalid!(in data/reservation.makereservation)'
            }
        }
        if (docid.constructor != ObjectID) {
            if (ObjectID.isValid(docid)) {
                docid = new ObjectID(docid);
            }
            else {
                throw 'Id is invalid!(in data/reservation.makereservation)'
            }
        }
    
        const dtarget = await doctors.getbyid(docid).catch(e => { throw e });
        const ptarget = await users.getbyid(userid).catch(e => { throw e }); */
        resvDate = new Date(resvDate);
    
        const appointmentsCollections = await appointments();
        //userid, docid, resvDate, hospName
        
        const newAppointment = {
            patient_id: userid,
            doctor_id: docid,
            hospital_id: hospid,
            date: resvDate,
            days: 0,
            notes:"",
            status: 'confirmed'
        }
    
        const insertinfo = await appointmentsCollections.insertOne(newAppointment);
        if (insertinfo.insertedCount === 0) throw 'Insert fail!';
        return await this.getAppointmentById(insertinfo.insertedId);
    },

    async getAppointmentById(id){

        if (!id) throw 'You must provide an id to search for';
        if(typeof id !== 'string' && typeof id !== 'object') throw 'id must be a string or object';
    
        if(typeof id === 'string'){
         id = ObjectId.createFromHexString(id);
        }
       
        const appointmentsCollection = await appointments();
        const appointment = await appointmentsCollection.findOne({ _id: id });
        if (appointment === null) throw 'No appointment with that id';
        //whole doc data
        return appointment;

    },

    async getReservationList(pid) {

        if (pid === undefined) {
            throw 'input is empty';
        }
        /* if(typeof pid === 'string'){
            pid = ObjectId.createFromHexString(pid);
           } */
    
        const appointmentsCollection = await appointments();
        const targets = await appointmentsCollection.find({ patient_id: pid }).sort({ date: -1 }).toArray();

        //const targets = await reservationCollections.find({patient_id:pid}).toArray();

        // no need to throw. patients can have no prior reservation history
        // if(targets.length === 0) throw 'Data not found!';
    
        for (let i = 0; i < targets.length; i++) {

            const reserv = await this.processReservationList(targets[i]);//process each reservation
        }
    
        var out = new Array(0);
        for(var x = 0 ;x < targets.length ; x++){
            if(targets[x].status != 'cancelled'){
                out.push(targets[x]);
            }
        }
    
        return out;
    },

    async processReservationList(reservation) {
        if (reservation) {
            let doctor = await this.getDoctor(reservation.doctor_id);
            let patient = await user.getUser(reservation.patient_id).catch(e => { throw e });
            let hospital = await this.getHospitalById(reservation.hospital_id);
            reservation["doctor"] = doctor;
            reservation["patient"] = patient;
            reservation["hospital"] = hospital; 
            reservation["date_formatted"] = new Date(reservation.date).toISOString().replace(/T.+/, '');
            reservation["status"] = reservation.status;
    
            // console.log(JSON.stringify(reservation, null, 4));
            // reservation["date_formatted"] = new Date(reservation.date).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        }
        return reservation;
    },

    //delete appoitnment by apoointment id
    async deleteAppointment(id){

        const appointmentsCollection = await appointments();
        if(typeof id === 'string'){
            id = ObjectId.createFromHexString(id);
        }
        const appointment = await this.getAppointmentById(id);
        
        const deletionInfo = await appointmentsCollection.deleteOne({ _id: id });

        if (deletionInfo.deletedCount === 0) {
            throw `Could not delete appointment with id of ${id}`;
        }
        let deletedAppointnment = {
            deleted: true,
            deletedAppointment: appointment,
        }
        return deletedAppointnment;

    },

    async getHospitalById(id) {

        if (!id) throw 'You must provide an id to search for';
        if(typeof id !== 'string' && typeof id !== 'object') throw 'id must be a string or object';
    
        if(typeof id === 'string'){
         id = ObjectId.createFromHexString(id);
        }
       
        const hospCollection = await hospitals();
        const hospital = await hospCollection.findOne({ _id: id });
        if (hospital === null) throw 'No hospital with that id';
    //whole doc data
        return hospital;
    },

    //doc id passed
    async getHospitalByDoc(id){
        const hospitalCollection = await hospitals();
        const docCollection = await doctors();
        const arrayOfHospitals = await hospitalCollection.find({doctors:id}).toArray();
        return arrayOfHospitals;

    },
    
    async getAllHospitals() {

        const hospitalCollection = await hospitals();
    
        const hospList = await hospitalCollection.find({}).toArray();
        
        return hospList;//list of hospitals
    },

    async getAllDoctors(){
        const doctorsCollections = await doctors();
        const docsList = await doctorsCollections.find({}).toArray();
        return docsList;

    }
    
    };