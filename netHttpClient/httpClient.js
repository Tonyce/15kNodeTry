'use strict';

const net = require('net');
const url = require('url');
const querystring = require('querystring');

function httpClient(options) {
	// options = {}
	let promise = new Promise((resolve, reject) => {
		let chunkTime = 0;
		let ret = {
			statusCode: 0,
			headers: "",
			body: ""
		}
		let statusCode = 0;
		let resHttpAgreeStr = ""
		let resHeaders = ""
		let resBody = ""

		// init socket send data;
		let method = options.method || "GET";
		let uri = options.url;
		let urlObj = url.parse(uri);
		let host = urlObj.host.split(":")[0] || "localhost";
		let port = urlObj.port || 80
		let pathname = urlObj.pathname || "/";
		let query = "";
		if (options.query) {
			query = "?"+querystring.stringify(options.query);
		}
		let headers = options.headers || {}; // set obj
		let body = JSON.stringify(options.body) || ""; // set str; check body obj or str or other. 

		
		let lenth = Buffer.byteLength(body, "utf8"); // utf8 是方法默认，可不写
		let httpAgreement = `${method} ${pathname}${query} HTTP/1.1\r\nHost: ${host}\r\n`+
							`Content-Length: ${lenth}\r\n`+ 
							`Connection: keep-alive\r\n`
							// `Connection: close\r\n`
		for (let key in headers) {
			httpAgreement += `${key}:${headers[key]}\r\n`
		}
		httpAgreement += "\r\n";
		let httpData = body;
		let socketConnection = {
			port: port,
			host: host
		}

		const client = net.connect(socketConnection, () => {
			client.write(httpAgreement);
			client.write(body);
			client.write("0\r\n\r\n")
		});

		
		let bufferArr = [];
		let bufferArrLen = 0;
		client.on('data', (chunk) => {
			chunkTime += 1
			if (chunkTime === 1) {
				let index = chunk.indexOf(new Buffer('\r\n\r\n'))
				let resData = chunk.slice(0, index);
				resHttpAgreeStr = resData.toString();
				let httpAgreeResult = handleHttpAgree(resHttpAgreeStr);
				statusCode = httpAgreeResult.status
				resHeaders = httpAgreeResult.headers;
				resBody = chunk.slice(index+4);
				bufferArrLen += resBody.length;
				bufferArr.push(resBody);
			}else {
				bufferArrLen += chunk.length;
				bufferArr.push(chunk);
			}
		});

		client.on('end', () => {
			ret.statusCode = statusCode;
			ret.headers = resHeaders;
			ret.body = Buffer.concat(bufferArr, bufferArrLen);
			resolve(ret)
			console.log('disconnected from server', ret.body.length);
		});

		client.on('error', (err) => {
		  	throw err; // if throw, it will be catch
		});
	})
	return promise;
}

module.exports = httpClient;

function handleHttpAgree(agreeStr) {
	let agreeStrArr = agreeStr.split("\r\n");
	let status = agreeStrArr[0].split(" ")[1];
	let headers = {}
	let headersArr = agreeStrArr.slice(2)
	for (let i = 0; i < headersArr.length; i++) {
		let keyV = headersArr[i].split(":");
		let key = keyV[0]
		let value = keyV[1]
		headers[key] = value
	}
	return {
		status: status,
		headers: headers
	}
}