const jwt = require('jsonwebtoken');
const config = require('../../config/index').token;
const Q = require('q');
(function(token){

  /**
   * 生成token
   */
  token.createAccessToken = (data) => {
    
    // const defer = Q.defer();
    // jwt.sign(data, config.secretOrPrivateKey, config.options, (err, authToken) => {
    //   if (err) return defer.reject(err);
    //   const authnToken = {
    //     // 'refresh_expiry': signingOptions.expiresIn,
    //     'access_token': authToken,
    //     'refresh_token': config.jwtid,
    //     'access_expiry': config.expiresIn
    //   };
    //   defer.resolve(authnToken);
    // });
    // return defer.promise;
    return jwt.sign(data, config.secretOrPrivateKey, config.options);
  };

  token.verifyAccessToken = (token) => {
    let options = {ignoreExpiration: true};
    // jwt.verify(token, config.secretOrPrivateKey, options, function(err, decoded){
    //   if(err){
    //     return false;
    //   }else{
    //     return true;
    //   }
    // });
    try{
      jwt.verify(token, config.secretOrPrivateKey, options);
      return true;
    }catch(error){
      return false;
    }
  }

}(exports))