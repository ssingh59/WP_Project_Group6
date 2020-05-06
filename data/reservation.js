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
    
    async makereservation(userid, docid, resvDate, hospName) {
        if (userid === undefined || docid === undefined || hospName === "") {
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
        userid, docid, resvDate, hospName
        
        const newAppointment = {
            patient_id: userid,
            doctor_id: docid,
            date: resvDate,
            hospital_name: hospName,
            days: 0,
            status: 'confirmed'
        }
    
        const insertinfo = await appointmentsCollections.insertOne(newAppointment);
        if (insertinfo.insertedCount === 0) throw 'Insert fail!';
    
        //return await this.getbyid(insertinfo.insertedocid);
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

    },

     async addUsers(userName,  email, password, mobileNumber, dob, address){
        const userCollection = await users();
        const userOld = await userCollection.findOne({ email: email.toLowerCase() });
        if (userOld !== null) throw 'User exists please login'
    
        var key = "ASECRET-HEALTHCARE-2019"
        var cipher = CryptoJS.AES.encrypt(password, key);
        cipher = cipher.toString();
        console.log(cipher);
        let newuser = {
            userName: userName,
            password: cipher,
            email: email.toLowerCase(),
            mobileNumber: mobileNumber,
            address: address,
            dob: dob,
        };
    
        const insertInfo = await userCollection.insertOne(newuser);
        if (insertInfo.insertedCount === 0) throw 'Insert failed';
    
        const newId = insertInfo.insertedocid;
        const user = await this.getUser(newId);
        return user;
    },
    
    async checkLogin( email, password){
        const userOld = await this.checkEmail(email);
        var key = "ASECRET-HEALTHCARE-2019"
        var decipher = CryptoJS.AES.decrypt(userOld.password, key);
        decipher = decipher.toString(CryptoJS.enc.Utf8);
        //console.log(decipher);
        if(password !== decipher) throw 'Incorrect password'
    
        return userOld;
    },
    async checkEmail(email){
        const userCollection = await users();
        const userOld = await userCollection.findOne({ email: email.toLowerCase() });
        if (userOld === null) throw 'User doesn\'t exists please sign up'
    
        return userOld;
    },
    async emailForgotPassword(email){
        const userOld = await this.checkEmail(email);
    
    let transport = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
           user: '3cd55a28d816d2',
           pass: '4e2d3ebed59090'
        }
    });
    const message = {
        from: userOld.email,
        to: userOld.email,
        subject: 'Password Reset',
        text: 'A password reset event has been triggered.'+
       ' To complete the password reset process, visit the following link:  http://localhost:3000/changePassword?id='+ userOld['_id'],
    };
    transport.sendMail(message, function (err, info) {
        if (err) throw err; 
     });
     return 'Email has been sent. Check your email to reset your password';
    },
    async removeuser(id) {
        const userCollection = await users();
        const user = await this.getUser(id);
        if(typeof id === 'string'){
            id = ObjectId.createFromHexString(id);
        }
        const deletionInfo = await userCollection.deleteOne({ _id: id });
    
        if (deletionInfo.deletedCount === 0) {
            throw `Could not delete user with id of ${id}`;
        }
        let deleteduser = {
            deleted: true,
            data: user,
        }
        return deleteduser;
    },
    async updateuser(userId, userName, password, email, mobileNumber, dob) {
        const userCollection = await users();
        const user = await this.getUser(userId);
        const updateduser = {
            userName: userName,
            password: password,
            email: email.toLowerCase(),
            mobileNumber: mobileNumber,
            address: user.address,
            dob: dob,
        };
    
        if(typeof userId !== 'string' && typeof userId !== 'object') throw 'id must be a string or object';
    
        if(typeof userId === 'string'){
            userId = ObjectId.createFromHexString(userId);
        }
    
        // const objId = ObjectId.createFromHexString(userId);
    
        const updatedInfo = await userCollection.updateOne({ _id: userId }, { $set: updateduser });
        if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) {
            throw 'Update failed';
        }
    
        return await this.getUser(userId);
    },
    async addAddress(userID, addressId, address, city, state, zip, country) {
        // let currentBand = await this.getBand(bandocid);
        // console.log(currentBand);
    
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
          {_id: userID},
          {$addToSet: {address: {id: addressId, address: address, city: city, state:state, zip:zip, country:country}}}
        );
    
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';
    
        return await this.getBand(userID);
      },
    
      async updateAddress(userId, addressId, address, city, state, zip, country) {
        // let currentBand = await this.getBand(bandocid);
        // console.log(currentBand);
        let secondUpdate = {
            $pull: {address: {id: addressId}}
          }
    
    
        const userCollection = await users();
        const deletePrevInfo = await userCollection.updateOne(
            {_id: userId}, secondUpdate);
    
        if (!deletePrevInfo.matchedCount && !deletePrevInfo.modifiedCount) throw 'Update failed';
    
        const updateInfo = await userCollection.updateOne(
          {_id: userId},
          {$addToSet: {address: {id: addressId, address: address, city: city, state:state, zip:zip, country:country}}}
        );
    
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';
    
        return await this.getUser(userId);
      },
    
      async updatePassword(userId, password) {
        const userCollection = await users();
        const user = await this.getUser(userId);
        var key = "ASECRET-HEALTHCARE-2019"
        var cipher = CryptoJS.AES.encrypt(password, key);
        cipher = cipher.toString();
        console.log(cipher);
        const updateduser = {
            userName: user.userName,
            password: cipher,
            email: user.email,
            mobileNumber: user.mobileNumber,
            address: user.address,
            dob: user.dob,
        };
    
        if(typeof userId !== 'string' && typeof userId !== 'object') throw 'id must be a string or object';
    
        if(typeof userId === 'string'){
            userId = ObjectId.createFromHexString(userId);
        }
    
        // const objId = ObjectId.createFromHexString(userId);
    
        const updatedInfo = await userCollection.updateOne({ _id: userId }, { $set: updateduser });
        if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) {
            throw 'Update failed';
        }
    
        return await this.getUser(userId);
      }
    
    
    };