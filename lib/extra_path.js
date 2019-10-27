/*
* @Author: tao.zhu
* @Date: 2017-08-01
 * @Last Modified by: tao.zhu
 * @Last Modified time: 2018-01-22 16:50:23
* @Description: 
* @dependencies: 
* @File Type: module
*/

const Path = require("path");
/**
 * 分析出包含别名的路径
 * 一般用于分析js，css文件中导入的包路径，析出真实的路径
 * @param  {String} dirName 相对路径的参照路径
 * @param  {array} paths 需要分析的路径
 * @param  {Object} alias 别名键值对
 * @return {array} 析出的路径数组
 */
const analyzePathContainAlias = (dirName, requirePaths, alias) => {
  let aliasKeys = [];
  let req = /require\s*\(\s*(\"|\')([\s\S]*?)\1\s*\)/;
  let results =[];
  for(let key in alias){
    aliasKeys.push(key);
  }
  requirePaths.forEach((mem, index, arr) => {
    //pathSplit 从require字串中取出路径，并分割
    let path = mem.replace(req, "$2");
    let pathSplit = path.split("/");
    let pathHead = pathSplit[0];
    if (pathSplit.length === 1){
      //长度为1，说明是引用外部包,不管
      return;
    } else {
      if (pathHead === "." || pathHead === ".."){
        //以.或..或路径开头
        results.push(Path.join(dirName, path));
      } else {
        //以路径开头
        let arrIndex = aliasKeys.indexOf(pathHead);
        if (arrIndex !== -1){
          pathSplit[0] = alias[aliasKeys[arrIndex]];
          results.push(pathSplit.join("/").replace("//","/"));
        } else {
          results.push(Path.join(dirName, path));
        }
      }
    }
  });
  return results;
};

module.exports = {analyzePathContainAlias};