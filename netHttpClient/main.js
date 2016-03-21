'use strict';

const httpClient = require("./httpClient")
const request = httpClient;
const fs = require("fs");

request({
	method: 'GET', // 请求方法
	url: 'http://localhost:8080', // 请求地址
	query: {a: 123, b: 456}, // query查询参数
	body: {c: 111, d: 'zxxxxx'}, // post body参数
	headers: {
		'user-agent': 'SuperID/Node.js', // 请求头
	}
})
.then(result => {
	// console.log("result", result)
	let photo = result.body
	fs.writeFile("b.png", photo, "binary")
	console.log(result.statusCode)
	console.log(result.headers)
})
.catch(err => {
	console.log("err", err.stack)
})
