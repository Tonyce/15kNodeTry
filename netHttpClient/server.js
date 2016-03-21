"use strict";

var http = require("http")
var fs = require("fs")

// console.log(data)
http.createServer(function (req, res) {
	var data = fs.readFileSync("a.png")
	
	console.log("method", req.method);
	console.log("url", req.url);
	console.log("headers", req.headers);

	res.end(data)
}).listen(8080, function() {
	console.log("start at 8080")
})
