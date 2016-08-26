
task 'clean', 'rm -f demo/test*.html', (options) ->
  ls("demo")
  .then (files)-> files.filter ({stat})-> getFileType(stat) is "file"
  .then (files)-> files.filter ({name})-> /^(.+)(?:test)|(?:sandbox)\.html$/.test(name)
  .then (files)-> files.map ({name})-> "demo/#{name}"
  .then (names)-> Promise.all names.map (name)-> fs.unlinkAsync(name).then -> name
  .then (names)-> console.log "clean", names
  .catch console.error.bind(console)

task 'sandbox', 'create demo/sandbox*.html', (options) ->
  fs.readFileAsync("src/HTML/placeholder.sandbox.html", "utf8")
  .then (html)->
    ls("dist")
    .then (files)-> files.filter ({stat})-> getFileType(stat) is "file"
    .then (files)-> files.filter ({name})-> /^(.+)\.sandbox\.js$/.test(name)
    .then (files)-> files.map ({name})-> /^(.+)\.sandbox\.js$/.exec(name)[1]
    .then (names)-> names.map (name)-> ["demo/#{name}.sandbox.html", html.split("placeholder").join(name)]
    .then (tuples)-> Promise.all tuples.map ([name, html])-> fs.writeFileAsync(name, html).then -> name
    .then (names)-> console.log "sandbox", names
  .catch console.error.bind(console)

task 'test', 'create demo/test*.html', (options) ->
  fs.readFileAsync("src/HTML/placeholder.test.html", "utf8")
  .then (html)->
    ls("dist")
    .then (files)-> files.filter ({stat})-> getFileType(stat) is "file"
    .then (files)-> files.filter ({name})-> /^(.+)\.test\.js$/.test(name)
    .then (files)-> files.map ({name})-> /^(.+)\.test\.js$/.exec(name)[1]
    .then (names)-> names.map (name)-> ["demo/#{name}.test.html", html.split("placeholder").join(name)]
    .then (tuples)-> Promise.all tuples.map ([name, html])-> fs.writeFileAsync(name, html).then -> name
    .then (names)-> console.log "test", names
  .catch console.error.bind(console)

task 'index', 'create src/index.ts file', (options) ->
  fs.readFileAsync("tsconfig.json", "utf8")
  .then (json)->
    json.split("\n")
    .filter (line)-> /^\s+"src\/([A-Za-z/]+)\.ts",/.test(line)
    .map (line)-> /^\s+"src\/([A-Za-z/]+)\.ts",/.exec(line)[1]
    .filter (name)-> name isnt "index"
    .map (name)-> console.log name; name
    .map (name)-> name.split("/")
    .map (name)-> [name[0], name[1], name.join("."), name.join("/")]
    #.reduce ((o, [sufix, prefix, objpath, path])-> o.concat 
    #.reduce ((o, [name, initial])-> o.concat [[name, (if o.some(([_,init])-> init is initial) then (a=Array.from(initial)).splice(1, 0, name[1]); a.join("") else initial)]] ), []
    #.map ([name, initial])-> "import * as _#{initial} from \"./#{name}\"; export var #{initial} = _#{initial};"
    .map (name)-> console.log name; name
    .join("\n") + """
    var _package = require("../package.json"); export var version = _package.version;
    import $ = require("jquery"); window["$"] = window["$"] || $;
    """
  .then (ts)-> fs.writeFileAsync("src/index.ts", ts)
  .then (done)-> console.log "done"
  .catch console.error.bind(console)



`
var fs = require("fs");
var path = require("path");

fs.readdirAsync = asynchronous(fs.readdir, fs);
fs.lstatAsync = asynchronous(fs.lstat, fs);
fs.readFileAsync = asynchronous(fs.readFile, fs);
fs.writeFileAsync = asynchronous(fs.writeFile, fs);
fs.unlinkAsync = asynchronous(fs.unlink, fs);

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