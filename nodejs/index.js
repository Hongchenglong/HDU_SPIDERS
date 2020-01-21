var mysql = require("mysql");
var http = require("http");
var url = require("url");
var fs = require("fs");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: 'SPIDERS'
});

var jsonResult;
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-origin': 'http://127.0.0.1:5500'
    });
    var params = url.parse(req.url,true).query;
    let sql = `select * from hdu where Pro_ID >= ${(params.page-1)*100+1000} and Pro_ID <${(params.page)*100+1000};`;
    //let sql = `select * from hdu where Pro_ID > 2000 and Pro_ID <3000;`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        jsonResult = JSON.stringify(result);//把results对象转为字符串，去掉RowDataPacket
        //console.log(jsonResult);
        //jsonResult = JSON.parse(jsonResult);//把results字符串转为json对象
        res.write(jsonResult);
        res.end();
    });
}).listen(8080);

http.createServer(function (req, res){
    
    if(req.url=="/"){
        fs.readFile("../public/index.html",(err,result)=>{
            res.end(result);
        })
    }
    if(req.url=="/css/style.css"){
        fs.readFile("../public/css/style.css",(err,result1)=>{
             res.end(result1);
        })
    }
    if(req.url=="/script/pageSelector.js"){
        fs.readFile("../public/script/pageSelector.js",(err,result)=>{
             res.end(result);
        })
    }
    if(req.url=="/script/mainTable.js"){
        fs.readFile("../public/script/mainTable.js",(err,result)=>{
             res.end(result);
        })
    }
    if(req.url=="/script/main.js"){
        fs.readFile("../public/script/main.js",(err,result)=>{
             res.end(result);
        })
    }
}).listen(80);
