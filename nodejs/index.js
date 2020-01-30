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
    try {
        if (err) throw err;
        console.log("Connected!");
    } catch (e) {
        console.log(e);
        console.log("connectError");
    }
});
http.createServer(function (req, res) {
    try {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-origin': 'http://acmhelper.zhoushouhao.com'
        });
        var params = url.parse(req.url, true).query;
        let sql = `select * from hdu where Pro_ID >= ${(params.page - 1) * 100 + 1000} and Pro_ID <${(params.page) * 100 + 1000} ORDER BY Pro_ID;`;
        //let sql = `select * from hdu where Pro_ID > 2000 and Pro_ID <3000;`;
        con.query(sql, function (err, result) {
            try {
                if (err) throw err;
                jsonResult = JSON.stringify(result);//把results对象转为字符串，去掉RowDataPacket
                //console.log(jsonResult);
                //jsonResult = JSON.parse(jsonResult);//把results字符串转为json对象
                res.write(jsonResult);
                res.end();
            } catch (e) {
                console.log(e);
                console.log("QueryError");
            }
        });
    } catch (e) {
        console.log(e);
        console.log("CreateServer8080Error");
    }
}).listen(8080);

http.createServer(function (req, res) {
    try {
        if (req.url == "/") {
            fs.readFile("../public/index.html", (err, result) => {
                res.end(result);
            })
        }
        else{
            fs.readFile("../public"+req.url,(err,result)=>{
                res.end(result);
            })
        }
    } catch (e) {
        console.log(e);
        console.log("CreateServer80Error");
    }
}).listen(80);
