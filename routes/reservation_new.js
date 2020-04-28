
const express = require('express');
const router = express.Router();
const usersData = require('../data/reservation');



  router.post('/reservation/new', async (req, res) => {
      
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
      debugger
      res.status(400).render('login', {
        error: e,
        hasErrors: true,
      });
      //res.sendStatus(400);

    }
  });

  module.exports = router;