const express = require('express');
const router = express.Router();
const usersData = require('../data/users');


router.post('/', async (req, res) => {
    let usersResponse = req.body;
    let username = usersResponse.username
    if (!username) {
      res.status(400).json({error: 'You must provide username'});
      return;
    }
    if (!usersResponse.email) {
      res.status(400).json({error: 'You must provide email'});
      return;
    }

    if (!usersResponse.password) {
      res.status(400).json({error: 'You must provide password'});
      return;
    }
  
    try {
      const result = await usersData.addUsers(
        usersResponse['username'], usersResponse['email'], usersResponse['password'], 
        "2012388477", "07-13-1994"," 1 Castle Point Ter, Hoboken, NJ 07030"
      );
      res.render('hospitals', {data: result});
    } catch (e) {
      res.status(400).render('signup', {
        error: e,
        hasErrors: true,
      });
      //res.sendStatus(400);

    }
  });

  router.post('/login', async (req, res) => {
    let usersResponse = req.body;
    if (!usersResponse.email) {
      res.status(400).json({error: 'You must provide email'});
      return;
    }

    if (!usersResponse.password) {
      res.status(400).json({error: 'You must provide password'});
      return;
    }
  
    try {
        const result = await usersData.checkLogin( usersResponse['email'], usersResponse['password']
      );
      res.render('hospitals', {data: result});
    } catch (e) {
      res.status(400).render('login', {
        error: e,
        hasErrors: true,
      });
      //res.sendStatus(400);

    }
  });
  router.post('/forgotPassword', async (req, res) => {
    let usersResponse = req.body;
    if (!usersResponse.email) {
      res.status(400).json({error: 'You must provide email'});
      return;
    }
  
    try {
        const result = await usersData.emailForgotPassword( usersResponse['email']);
      res.render('forgotPassword', {
        data: result,
        isSuccess: true,
      });
    } catch (e) {
      res.status(400).render('forgotPassword', {
        error: e,
        hasErrors: true,
      });
      //res.sendStatus(400);

    }
  });
  router.post('/resetPassword', async (req, res) => {
    let usersRequest = req.query;
    console.log(usersRequest.id);
    let usersResponse = req.body;
    if (!usersRequest.id) {
      res.status(400).json({error: 'You must provide id'});
      return;
    }
  
    try {
        const result = await usersData.updatePassword(usersRequest.id, usersResponse['password']);
      res.render('login');
    } catch (e) {
      res.status(400).render('changePassword', {
        error: e,
        hasErrors: true,
      });
      //res.sendStatus(400);

    }
  });

  module.exports = router;
