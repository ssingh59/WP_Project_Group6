const CryptoJS = require("crypto-js");
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const hospitals = mongoCollections.hospitals;
const doctors = mongoCollections.doctors;
const appointments = mongoCollections.appointments;
const { ObjectId } = require('mongodb');
const nodemailer = require("nodemailer");


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
        if (appointment === null) throw 'No user with that id';
    //whole doc data
        return appointment;

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