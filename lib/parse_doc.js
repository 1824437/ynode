const fs = require("fs");
/**
 * read .string file
 */
require.extensions[".json"] = (module, fileName) => {
  let content = fs.readFileSync(fileName, "utf-8");
  try {
    module.exports = JSON.parse(content);
  } catch (e){
    //todo
    throw e;
  }
}
