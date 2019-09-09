
const uuid = require('uuid');


var config = {
    mysql: {
      dbHost: ['127.0.0.1'],
      dbPort: 3306,
      dbUser: 'root',
      dbPassword: '123456',
      dbName: 'crud',
      dbCrypto: false
    },
    // jwt.sign(payload, secretOrPrivateKey, [options, callback])
    token: {
      secretOrPrivateKey: 'server',
      options: {
        jwtid: uuid(),
        // refreshExpiry: 7 * 24 * 60 * 60 * 1000,
        expiresIn: 30 * 60,
      }
    }
}

module.exports = config;