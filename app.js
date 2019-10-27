global._root = __dirname;
const cluster = require('cluster');
const http = require("http");
const os = require("os");
const util = require('util');

const express = require("express");
const formidable = require('formidable');
const multiProcess = require(`${_root}/server/multi-process.js`);
// 全局配置

//静态变量
require(`${_root}/config/static`); 
require(`${_root}/lib/parse_doc`); 
//require解析额外文件
const {test, vuetest, vuerouter} = require(`${_root}/lib/handlebars`).cache; //handlebars扩展


let app = new express();
app.use(function(req, res, next) {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('anthor', 'tao.zhu');
  next();
});

var js = '{"a":"<p style=\"color:red;\"></p>"}';
app.get("/", (req, res) => {
  // let time = 2*1000;
  // let startTime = new Date();
  // let endTime = new Date();
  
  // while ((endTime -startTime)<= time){
  //   endTime = new Date();
  // }
  res.end(vuerouter());
});

app.all("/ab", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://www.x.com.cn");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.end(JSON.stringify({"a":1, "b": "infos"}));
});

multiProcess.listen(app);

// if(cluster.isMaster){
//   console.log(`${process.pid}开始了。`);
//   for(let i = 0; i < cpuNum; i++){
//     let worker = cluster.fork();

//     console.log(worker.process.pid);
//   }
//   //app.listen(8801);
//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`${process.pid}退出了。`);
//   })
// } else {
//   app.listen(8801);
//   console.log("start");
// }

