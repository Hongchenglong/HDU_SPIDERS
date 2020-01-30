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
con.connect(function (err) {
    try {
        if (err) throw err;
        console.log("Connected!");
    } catch (e) {
        console.log(e);
        console.log("connectError");
    }
});
// URL/?Pro=8888&Title=aaa&Tags=bbb&Ratio=ccc&Link=ddd
http.createServer(function(req,res){
    try{
        var params = url.parse(req.url, true).query;
        let sql = `INSERT INTO hdu(Pro_ID,Title,Tags,Ratio,Link) VALUES(${params.Pro},'${params.Title}','${params.Tags}','${params.Ratio}','${params.Link}') ON DUPLICATE KEY UPDATE Pro_ID = '${params.Pro}',Title='${params.Title}',Tags='${params.Tags}',Ratio='${params.Ratio}',Link='${params.Link}'`;
        con.query(sql, function (err, result) {
            if (err) console.log(err);
            res.end(`INSERT ${params.Pro} OK!`)
        });
    } catch (e) {
        console.log(e);
        console.log("CreateServer8990Error");
    }
}).listen(8990);
