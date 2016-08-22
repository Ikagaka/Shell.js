`
var fs = require("fs");
var path = require("path");
fs.readdirAsync = asynchronous(fs.readdir, fs);
fs.lstatAsync = asynchronous(fs.lstat, fs);
fs.readFileAsync = asynchronous(fs.readFile, fs);
fs.writeFileAsync = asynchronous(fs.writeFile, fs);
fs.unlinkAsync = asynchronous(fs.unlink, fs);
`

task 'clean', 'rm -f demo/test*.html', (options) ->
  ls("demo")
  .then (files)-> files.filter ({stat})-> getFileType(stat) is "file"
  .then (files)-> files.filter ({name})-> /^test(.+)\.html$/.test(name)
  .then (files)-> Promise.all files.map ({name})-> fs.unlinkAsync("demo/"+name)
  .catch console.error.bind(console)
task 'build', 'touch demo/test*.html', (options) ->
  fs.readFileAsync("demo/placeholder.test.html", "utf8").then (html)->
    ls("dist")
    .then (files)-> files.filter ({stat})-> getFileType(stat) is "file"
    .then (files)-> files.filter ({name})-> /^(.+)\.test\.js$/.test(name)
    .then (files)-> files.map ({name})-> /^(.+)\.test\.js$/.exec(name)[1]
    .then (names)-> names.map (name)-> [name, html.split("placeholder").join(name)]
    .then (htmls)-> Promise.all htmls.map ([name, html])-> fs.writeFileAsync("demo/test#{name}.html", html)
    .then (done)-> console.log "done"
  .catch console.error.bind(console)
  


`
function asynchronous(fn, ctx){
  return function _asyncFn(){
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function(resolve, reject){
      fn.apply(ctx, args.concat(function(err, val){
        if(err){
          reject(err);
        }else{
          resolve(val);
        }
      }));
    });
  };
}
function ls(pathname){
  return fs.readdirAsync(pathname)
  .then(function(names){
    return Promise.all(
      names.map(function(name){
        return fs.lstatAsync(path.join(pathname, name))
        .then(function(stat){
          return {name: name, stat: stat};
        });
      })
    )
  });
}
function getFileType(stat){
  return stat.isFile() ? "file"
       : stat.isDirectory() ? "dir"
       : stat.isBlockDevice() ? "blcdev"
       : stat.isCharacterDevice() ? "chardev"
       : stat.isSymbolicLink() ? "symlink"
       : stat.isFIFO() ? "fifo"
       : stat.isSocket() ? "socket"
       : "unkown";
}
`