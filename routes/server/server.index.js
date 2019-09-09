var express = require('express');
var router = express.Router();
const controller = require('./server.controller')

/* GET home page. */
router.get('/', function(req, res){
  res.render('login');
})

router.post('/login', controller.login);

router.post('/registe', controller.register);

router.get('/oauth2', controller.oauth2);

router.get('/userAuthorize', controller.userAuthorize);
router.post('/userAuthorize', controller.userAuthorizeP);

router.post('/getAccessToken', controller.getAccessToken);

router.post('/getResource', controller.getResource);

module.exports = router;
