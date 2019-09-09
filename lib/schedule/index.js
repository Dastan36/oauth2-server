const schedule = require('node-schedule');
const repository = require('../../routes/server/server.repository');

(function(sche){
  // 这里测试 时间就写短点
  sche.accessTokenSchedule = (openId) => {

    var job = schedule.scheduleJob('30 * * * * *', function(){

      return repository.expireAccessToken({userId: openId}).then((data) => {
        // 执行一次就取消
        console.log(data);
        if(data.affectedRows === 1){
          setTimeout(function(){
            job.cancel();
          },1000);
        }
      })
    })
    
  }
}(exports));