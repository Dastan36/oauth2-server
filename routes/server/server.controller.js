const repository = require('./server.repository');
const uuid = require('uuid');
const fs = require('fs');
const tokenAcc = require('../../lib/jwt/index');
const schedule = require('../../lib/schedule/index');
var openId; // 记录用户登录
var code; //授权码
((controller) => {
  
  // A的登录
  controller.login = (req, res) => {
    let body = req.body;
    let response_type = body.response_type;
    let client_id = body.client_id;
    let redirect_url = body.redirect_url;
    let scope = body.scope;
    let state = body.state;
    try{
      if(body.name && body.password){
        return repository.get({name:body.name, password: body.password}).then((data) => {
          if(data.length >0){
            let user = {
              name: body.name,
              password: body.password
            };
            let token = tokenAcc.createAccessToken(user);
            openId = data[0].userId;
            res.cookie('name', user.name, { maxAge: 1000 * 60 * 60 * 24, path: '/' });
            res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 24, path: '/' });
            res.render('authorization.ejs', { name: body.name, response_type: response_type, client_id: client_id, redirect_url: redirect_url, scope: scope, state: state});
            fs.readFile('views/authorization.ejs', 'utf-8', function (err, data) {
              if (err) {
                throw err;
              }
              res.end(data);
            });
          }else{
            res.render('login.ejs', {msg:'用户名或密码错误', response_type: response_type, client_id: client_id, redirect_url: redirect_url, scope: scope, state: state })
            fs.readFile('views/login.ejs', 'utf-8', function (err, data) {
              if (err) {
                throw err;
              }
              res.end(data);
            });
          }
          
        })
      };
    }catch(e){
      console.log(e);
    }
  }

  controller.register = (req, res) => {
    // console.log('register')
    // console.log(req);
    // 开始注册
    let queryParam = req.body;
    return repository.insert(queryParam).then((data) => {
      // console.log(data);
      // 注册成功
      if (data.affectedRows > 0) {

        // 授权方给出 client_id client_serect client_credentials
        let d = new Date();
        let client_id = uuid();
        let client_secret = d.getFullYear() + '' + d.getMonth() + '' + d.getDate();
        let client_credentials = client_id + client_secret;
        let updateParam = {
          clientId: client_id,
          clientSecret: client_secret,
          clientCredentials: client_credentials,
          id: data.insertId
        };
        return repository.updateClient(updateParam).then((data) => {
          // console.log(data);
          res.send({
            err: 0,
            mess: '申请授权注册成功'
          })
        })
      }
    })
  },
  // 客户端 用户点击第三方登录 跳转到A
    controller.oauth2 = (req, res) => {
      // console.log('oauth2');
      // console.log(req);
      let response_type = req.query.response_type;
      let client_id = req.query.client_id;
      let redirect_url = req.query.redirect_url;
      let scope = req.query.scope;
      let state = req.query.state;
      // 假装验证一下 （简单验证一下）
      if(response_type === 'code'){
        try{
            return repository.selectClientId({client_id: client_id}).then((data) => {
            // console.log(data);
            if(data[0]){
              // 得到A服务的token
              res.redirect('/userAuthorize?response_type='+response_type+'&client_id='+client_id+'&redirect_url='+redirect_url+'&scope='+scope+'&state='+state);
            }
          })
        }catch(e){
          console.log(e);
        }
      }
    },

    // A oauth2调到此  获取用户token
    controller.userAuthorize = (req, res) => {
      // console.log('userAuthorize'+req);
      // console.log(req);
      let name = req.cookies.name;
      let token = req.cookies.token;

      let response_type = req.query.response_type;
      let client_id = req.query.client_id;
      let redirect_url = req.query.redirect_url;
      let scope = req.query.scope;
      let state = req.query.state;
      //此处需要验证上述数据  判断是否有权限授权   目前省略

      if(tokenAcc.verifyAccessToken(token)){
        res.render('authorization.ejs', { name: name, response_type: response_type, client_id: client_id, redirect_url: redirect_url, scope: scope, state: state});
        fs.readFile('views/authorization.ejs', 'utf-8', function (err, data) {
          if (err) {
            throw err;
          }
          res.end(data);
        });
      }else{
        res.render('login.ejs', { msg:'', response_type: response_type, client_id: client_id, redirect_url: redirect_url, scope: scope, state: state })
        fs.readFile('views/login.ejs', 'utf-8', function (err, data) {
          if (err) {
            throw err;
          }
          res.end(data);
        });
      }
      
    },

    // A 点击授权
    controller.userAuthorizeP = (req, res) => {
      // console.log('userAuthorizeP');
      let body = req.body;

      code = uuid();
      // 一定时间 code过期
      setTimeout(function(code){
        code = uuid();
      },1000*10);
      let state = body.state;
      res.redirect(302, body.redirect_url+'?code='+code+'&state='+state);
    },
    // 客户端请求accesstoken 验证成功 发送accesstoken
    controller.getAccessToken = (req, res) => {
      
      // console.log(req);
      let body = req.body;
      var client_id = body.client_id;
      // 验证  校验authorization code是否过期  ---------》》过期还没做
      if(body.code === code){
        return repository.selectClientId({client_id: client_id}).then((data) => {
          // console.log(data);
          if(data[0]){
            if('authorization_code' === body.grant_type){
              if(data[0].clientSecret === body.client_secret){
                // A服务 需要将access_token 存数据库
                let access_token = uuid();
                let param = {
                  access_token: access_token,
                  userId: openId
                };
                return repository.saveAccessToken(param).then((data) => {
                  let accessToken = {
                    "access_token": access_token,
                    "token_type":"bearer",
                    "expires_in":3600, //
                    "refresh_token":"IwOGYzYTlmM2YxOTQ5MGE3YmNmMDFkNTVk",
                    "scope":"create delete"
                  };
                  // A 开启accessToken 过期
                  schedule.accessTokenSchedule(openId);
                  res.send(accessToken);
                })
                
              }
            }
          }
        });
      }else{
        res.send('授权码失效');
      }
    
      // res.send('ok');
    },

    controller.getResource = (req, res) => {
      var access_token = req.body.access_token;
      return repository.getUserByToken({access_token: access_token}).then((data) => {
        res.send(data[0]);
      })
    }
})(exports)