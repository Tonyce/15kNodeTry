'use strict';

const redis = require("redis")
    // client = redis.createClient(10000);
let redisClient = ""
let port = ""
let host = ""
let maxAge = ""
let sessionId = ""


let sessions = {}
function mySession(options) {
	
	if (!redisClient) {
		port = options.connection.port;
		host = options.connection.host;
		maxAge = options.maxAge;
		sessionId = options.sessionId;
		redisClient = redis.createClient(port, host);	
		redisClient.on("end", () => {
			redisClient = ""
		})
	}

	const sessionMiddle = function (req, res, next) {
		let session = {}
		let sessionid = req.cookies[sessionId];
		// console.log("sessionid", sessionid)

		if (req.session) {
			return next()
		} 
		if (sessionid) {
			redisClient.get(sessionid, (err, reply) => {
				if (err) {
					console.log("err", err)
				}
				req.session = JSON.parse(reply) || {}
				console.log("ss", req.session)
				res.cookie(sessionId, sessionid, { expires: new Date(Date.now() + 900000), httpOnly: true });
				next()	
			})
		}else {
			sessionid = new Date().getTime();
			// sessions.sessionid = session;
			redisClient.set(sessionid, value, (err, reply) => {});
			redisClient.expire(sessionid, maxAge || 0);
			res.cookie(sessionId, sessionid, { expires: new Date(Date.now() + 900000), httpOnly: true });
			next()
		}

		var _end = res.end;
		var _write = res.write;
		res.end = function end(chunk, encoding) {
			let value = JSON.stringify(req.session)
			redisClient.set(sessionid, value, (err, reply) => {});
			redisClient.expire(sessionid, maxAge || 0);
			console.log("----------", req.session)
			

			_write.call(res, chunk, encoding);
			_end.call(res);
		}	
	}
	return sessionMiddle
}

module.exports = mySession

function getCookieObj(cookieStr) {
	if (typeof cookieStr !== "string") {
		return ""
	}
	let cookieObj = {}
	let cookieArr = cookieStr.split(";")
	for (let i = 0; i < cookieArr.length; i++) {
		let cookieItem = cookieArr[i].trim()
		let equalIndex = cookieItem.indexOf("=");
		let key = cookieItem.substr(0, equalIndex)
		let value = cookieItem.substr(equalIndex + 1)
		cookieObj[key] = value
	}
	return cookieObj
}