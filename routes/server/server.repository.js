const mysql = require('../../lib/repository/baseRepository');
const uuid = require('uuid');

module.exports = {
  insert: function (obj) {
    let sql = `insert into registeraccess (id, clientName, clientPath, redirectURI) values (?,?,?,?)`;
    var values = [];
    values.push(uuid());
    values.push(obj.clientName);
    values.push(obj.clientPath);
    values.push(obj.redirectURI);
    return mysql.query(sql, values);
  },
  updateClient: function (obj) {
    let sql = `update registeraccess set clientId = ?, clientSecret = ?, clientCredentials = ? where id = ?`;
    var values = [];
    values.push(obj.clientId);
    values.push(obj.clientSecret);
    values.push(obj.clientCredentials);
    values.push(obj.id);
    return mysql.query(sql, values);
  },
  selectClientId: function(obj) {
    let sql = `select * from registeraccess where clientId = ?`;
    var values = [];
    values.push(obj.client_id);
    return mysql.query(sql, values);
  },
  get: function (obj) {
    let sql = `select * from user where name = ? and password = ?`;
    // let sql = `select * from user where name='admin' and password='1234567890'`;
    var values = [];
    values.push(obj.name);
    values.push(obj.password);
    return  mysql.query(sql,values);
  },
  saveAccessToken: function(obj) {
    let sql = `update user set access_token = ? where userId = ?`;
    var values = [];
    values.push(obj.access_token);
    values.push(obj.userId);
    return  mysql.query(sql,values);
  },
  // AccessToken 过期 暂时将其置为一个不知道的uuid
  expireAccessToken: function(obj) {
    let sql = `update user set access_token = ? where userId = ?`;
    var values = [];
    values.push(uuid());
    values.push(obj.userId);
    return  mysql.query(sql,values);
  },
  getUserByToken: function(obj) {
    let sql =  `select name from user where access_token = ?`;
    var values = [];
    values.push(obj.access_token);
    return  mysql.query(sql,values);
  }
}