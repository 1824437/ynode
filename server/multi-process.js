/*
 * @Author: tao.zhu 
 * @Date: 2018-04-26 11:09:19 
 * @Last Modified by: tao.zhu
 * @Last Modified time: 2018-04-26 11:09:42
 */

const os = require("os");
const http = require("http");
const cluster = require("cluster");


const workers = {};
let limitRestartUp = 10;
let duration = 10 * 60 * 60;

function createWorker (isRecreate){
  let worker = cluster.fork();
  workers[worker.process.pid] = worker;
  console.log(`worker: ${worker.process.pid}, is ${isRecreate ? "added to create" : "created"}.`);
}

exports.listen = (app, opts = {}) => {
  let {port = 8801, numCPUs = os.cpus().length} = opts;

  if (process.argv.findIndex(el => el === "debug=true") !== -1){
    numCPUs = 1;
  }
  if(cluster.isMaster){
    for(let i = 0; i < numCPUs; i++){
      createWorker();
    }
    //worker process异退后重建。
    cluster.on("exit", (worker, code, signal) => {
      
      delete workers[worker.process.pid];
      //频繁异退后报警, 10分钟内10次
      //todo
      console.log( `${worker.process.pid} is dead！`);
      createWorker(true);
    });

  } else {
    http.createServer(app).listen(port);
  }
  
}