/*
* @Author: tao.zhu
* @Date: 2017-08-01
 * @Last Modified by: tao.zhu
 * @Last Modified time: 2018-01-22 17:40:13
* @Description: 
* @dependencies: 
* @File Type: module
*/

const _ = x => x;
const FS = require("fs");
const Path = require("path");
/**
 * json-beautify, 美化json, 输出json文档用
 * https://www.npmjs.com/package/json-beautify
 * 
 * run FormatJson(value, replacer, space, limit)
 *    
 * @param value {object} 要输出的对象
 * @param replacer 替换，支持F,O,A,具体怎么用没研究过，=null不开启
 * @param space {number} 缩进空格数
 * @param {limit} [number] 一行多少个字符
 */

/**
 * 文件内的全局静态地象
 * @type {Object} 
 */
const __static = {
  multiLineCComments : /\/\*[\s\S]*?\*\//gm,
  singleLineCComments : /\/\/.*$/gm
};

let {log: _lg, error: _er, info: _inf} = console;
/**
 * 校验路径是否存在。
 * 
 * @param  {string} _path 
 * @param  {number} _type ,只有两个值，0 表示必须是目录，1表示必须是文件，如果无参，只检查路径合法性。
 * @return fs.stat 合法返回文件或目录状态
 * @return null 不合法返回null
 *
 * eg:
 * _path 检查路径是否存在，文件目录都合法
 * _path, 0,检查路径存在且目录
 * _path, 1,检查路径存在且文件
 */
const _chkPath = (_path, _type = -1) => {
  // 校验路径是否存在。
  let status, type, typeCn;

  if (_type === 0){
    type = "isDirectory";
    typeCn = "目录";
  } else if (_type === 1) {
    type = "isFile";
    typeCn = "文件";
  }
  try {
    status = FS.statSync(_path);
    if (_type === -1){
      return status;
    }
    if (status[type]()){
      return status;
    } else {
      return null;
    }
  } catch (e){
    return null;
  }
  
};

/**
 * 将_path转换成路径树，如"./a/b/c"，拆成
   ["./a/b/c","./a/b","./a"]
 * @param  {String} _path 需要转换的路径
 * @return {undefined} 
 */
// const _getPathTree = _path => {
//   let _pathTree = [];

//   while(
//     _chkPath(_path, 0) === null
//     && Path.dirname(_path) !== _path
//   ){
//     _pathTree.push(_path);
//     _path = Path.dirname(_path);
//   }

//   return _pathTree;
// }

/**
 * 循环目录
 * @param  {String}   _path      需在循环的路径
 * @param  {number}   depth     循环深度
 * @param  {Function} forEachCb 每个节点循环后想干点啥                            
 * @param  {Function} cb        最后循环完了想干点啥
 * @return {undefined} 返回的是cb的运行结果
 */
const eachDir = ({depth = 999, _path, forEachCb = _, cb = _} = config) => {
  // {array} 路径下的文件及目录
  let childs = [];
  let fdStatus = _chkPath(_path, 0);

  //检查合法性
  if(fdStatus === null){
    return;
  }
  //ls
  childs = FS.readdirSync(_path);
  
  forEachCb({_path});
  
  if(depth === 0){
    return;
  }
  depth -= 1;
  childs.forEach((mem, index) => {
    eachDir({
      depth,
      _path : Path.join(_path, mem),
      forEachCb,
      cb: _
    });
  });
  return cb();
};

/**
 * 同步读路径下的指定扩展名的文件
 * @param  {string}  _path 目录路径，文件无效
 * @param  {array}  ext 读哪些扩展名".jpg"
 * @param  {Function}  cb 读完做啥
 * @return cb()
 */
const cat = ({_path = "", ext = [], cb = _, isClearComment = true} = config) => {
  if(_path.constructor !== String){
    _er("[参数错误] _path");
    return;
  }
  if(ext.constructor !== Array){
    _er("[参数错误] ext");
    return;
  }
  if(cb.constructor !== Function){
    _er("[参数错误] cb");
    return;
  }

  let dirStatus = _chkPath(_path);
  let childs;

  //如不是目录退出
  if (dirStatus === null){
    console.log("读文件异常 " + _path);
    return;
  }
  //文件
  if (dirStatus.isFile()){
    let content = FS.readFileSync(_path, "utf-8");
    if(isClearComment){
      content = content.replace(__static.singleLineCComments, "")
                       .replace(__static.multiLineCComments, "");
    }
    cb({_path: _path, content });
    return content;
  }
  //目录
  if (dirStatus.isDirectory()){
    //ls
    childs = FS.readdirSync(_path);
    childs.forEach((mem,index) => {
      let childPath = Path.join(_path, mem);
      let childPathStatus = _chkPath(childPath, 1);//检测是不是文件

      if (childPathStatus === null){
        return;
      }

      let extName = Path.extname(childPath);
      let testExt = ext.length 
      ? new RegExp("^\\.(" + ext.join("|").replace(/[.]/g, "") + ")$") 
      : /.*/g;

      if (testExt.test(extName)){
        fileBody = FS.readFileSync(childPath, "utf-8");
        cb({_path: childPath, content: fileBody});
      } else {
        cb({_path: childPath, content: ""});
      }
    });
  }
};

/**
 * 创建文件夹
 * @param  {String} _path    
 * @param  {String} dirName 
 * @param  {Number} depth 0 在上级路径创建 1 在路径下创建 
 * 如遇root,会在root下创建
 * @return {String} 新创建的路径
 * @return {undefined} 路径不存在时返回，多级创建请使用mkdirs
 */
const mkdir = (_path, dirName = "", depth = 1) => {
  let _pathStatus = _chkPath(_path, 0);
  let createPath = depth === 0 
  ? Path.join(Path.parse(_path).dir, dirName)
  : Path.join(_path, dirName);
  if (_pathStatus === null){
    return;
  }
  if (_chkPath(createPath, 0, true) === null){
    FS.mkdirSync(createPath);
  } else {
    _lg("文件夹创建失败，文件夹已存在] " + createPath);
  }

  return createPath;
};

/**
 * 通过路径依次递归创建文件夹
 * @param  {String} _path
 * @return true
 */
const mkdirs = _path => {
  let _pathTree = [];
  let __path = _path;
  while(
    _chkPath(__path, 0) === null
    && Path.dirname(__path) !== __path
  ){
    _pathTree.push(__path);
    __path = Path.dirname(__path);
  }
  for(let l = _pathTree.length -1; l >= 0; l--){
    FS.mkdirSync(_pathTree[l]);
  }
  return _path;
};

/**
 * 复制文件
 * @param  {String} sourcePath 源文件路径
 * @return {String} destPath   目标目录路径
 */
const cp = (sourcePath, destPath) => {
  let sourcePathStatus = _chkPath(sourcePath, 1);

  if(sourcePathStatus === null){
    _lg("[文件复制失败，源文件不存在] " + sourcePath);
    return false;
  }
  FS.createReadStream(sourcePath)
  .pipe(FS.createWriteStream(destPath));
};

//将json文件转换为json对象
const loadJsonFile = _path => {
  let _pathStatus = _chkPath(_path, 1);

  if (_pathStatus){
    let content = FS.readFileSync(_path, "utf-8");
    return JSON.parse(
      content.replace(__static.singleLineCComments, "")
      .replace(__static.multiLineCComments, "")
    );
  } else {
    return null;
  }
};



/**
 * 给路径加上后缀
 * @param {String} _path 
 * @param {array} exts
 * @return {string} 添加了扩展名的路径
 * @return {null} 路径异常，无法获得正确的路径
 */
const addExtNameForPath = (_path, exts = []) => {
  let _pathStatus = _chkPath(_path, 1);
  if (_pathStatus === null){
    //exts = 
  } else {
    return _path;
  }
};
module.exports = {
  eachDir, cat, mkdir, mkdirs,
  _chkPath, cp, loadJsonFile,
  addExtNameForPath
};