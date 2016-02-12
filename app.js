"use strict";
/* global process */
/* global __dirname */
/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved. 
 *
 * Contributors:
 *   David Huffman - Initial implementation
 *******************************************************************************/
/////////////////////////////////////////
///////////// Setup Node.js /////////////
/////////////////////////////////////////
var express = require('express');
var session = require('express-session');
var compression = require('compression');
var serve_static = require('serve-static');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var url = require('url');
var async = require('async');
var setup = require('./setup');
var cors = require("cors");
var fs = require("fs");

//// Set Server Parameters ////
var host = setup.SERVER.HOST;
var port = setup.SERVER.PORT;

////////  Pathing and Module Setup  ////////
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.engine('.html', require('jade').__express);
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded()); 
app.use(cookieParser());
app.use('/cc/summary', serve_static(path.join(__dirname, 'cc_summaries')) );												//for chaincode investigator
app.use( serve_static(path.join(__dirname, 'public'), {maxAge: '1d', setHeaders: setCustomCC}) );							//1 day cache
//app.use( serve_static(path.join(__dirname, 'public')) );
app.use(session({secret:'Somethignsomething1234!test', resave:true, saveUninitialized:true}));
function setCustomCC(res, path) {
	if (serve_static.mime.lookup(path) === 'image/jpeg')  res.setHeader('Cache-Control', 'public, max-age=2592000');		//30 days cache
	else if (serve_static.mime.lookup(path) === 'image/png') res.setHeader('Cache-Control', 'public, max-age=2592000');
	else if (serve_static.mime.lookup(path) === 'image/x-icon') res.setHeader('Cache-Control', 'public, max-age=2592000');
}
// Enable CORS preflight across the board.
app.options('*', cors());
app.use(cors());

///////////  Configure Webserver  ///////////
app.use(function(req, res, next){
	var keys;
	console.log('------------------------------------------ incoming request ------------------------------------------');
	console.log('New ' + req.method + ' request for', req.url);
	req.bag = {};											//create my object for my stuff
	req.session.count = eval(req.session.count) + 1;
	req.bag.session = req.session;
	
	var url_parts = url.parse(req.url, true);
	req.parameters = url_parts.query;
	keys = Object.keys(req.parameters);
	if(req.parameters && keys.length > 0) console.log({parameters: req.parameters});		//print request parameters
	keys = Object.keys(req.body);
	if (req.body && keys.length > 0) console.log({body: req.body});						//print request body
	next();
});

//// Router ////
app.use('/', require('./routes/site_router'));

////////////////////////////////////////////
////////////// Error Handling //////////////
////////////////////////////////////////////
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
app.use(function(err, req, res, next) {		// = development error handler, print stack trace
	console.log("Error Handeler -", req.url);
	var errorCode = err.status || 500;
	res.status(errorCode);
	req.bag.error = {msg:err.stack, status:errorCode};
	if(req.bag.error.status == 404) req.bag.error.msg = "Sorry, I cannot locate that file";
	res.render('template/error', {bag:req.bag});
});

// ============================================================================================================================
// 														Launch Webserver
// ============================================================================================================================
var server = http.createServer(app).listen(port, function() {});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.NODE_ENV = 'production';
server.timeout = 240000;																							// Ta-da.
console.log('------------------------------------------ Server Up - ' + host + ':' + port + ' ------------------------------------------');
if(process.env.PRODUCTION) console.log('Running using Production settings');
else console.log('Running using Developer settings');


// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

// ============================================================================================================================
// 														Warning
// ============================================================================================================================

// ============================================================================================================================
// 														Entering
// ============================================================================================================================

// ============================================================================================================================
// 														Test Area
// ============================================================================================================================
var part1 = require('./utils/ws_part1');
var part2 = require('./utils/ws_part2');
var ws = require('ws');
var wss = {};
var Obc1 = require('./utils/obc-js/index');
var obc = new Obc1();

// ==================================
// load peers manually or from VCAP, VCAP will overwrite hardcoded list!
// ==================================
var manual = {
  "credentials": {
    "peers": [
      {
        "discovery_host": "169.44.38.113",
        "discovery_port": "33832",
        "api_host": "169.44.38.113",
        "api_port": "33833",
        "type": "peer",
        "network_id": "6862f6da-9a67-4873-b68d-bd6c202ba743",
        "id": "6862f6da-9a67-4873-b68d-bd6c202ba743_vp1",
        "api_url": "http://169.44.38.113:33833"
      },
      {
        "discovery_host": "169.44.38.113",
        "discovery_port": "33836",
        "api_host": "169.44.38.113",
        "api_port": "33837",
        "type": "peer",
        "network_id": "6862f6da-9a67-4873-b68d-bd6c202ba743",
        "id": "6862f6da-9a67-4873-b68d-bd6c202ba743_vp2",
        "api_url": "http://169.44.38.113:33837"
      }
    ],
    "users": [
      {
        "username": "peer1",
        "secret": "f253fd74d7"
      },
      {
        "username": "peer2",
        "secret": "5d35496cc1"
      },
      {
        "username": "user_3448c2c979",
        "secret": "b4e7cfe9c2"
      },
      {
        "username": "user_97b5583bc4",
        "secret": "1a9d6d2c0a"
      },
      {
        "username": "user_d97e6fd667",
        "secret": "533c03ef77"
      },
      {
        "username": "user_99299d686f",
        "secret": "12b029bfa1"
      },
      {
        "username": "user_662b94ddd9",
        "secret": "bd14f27805"
      },
      {
        "username": "user_9fb09fb7f0",
        "secret": "a85e73c7e1"
      },
      {
        "username": "user_64f78eb146",
        "secret": "6d6f77f8b0"
      },
      {
        "username": "user_90ec1907b4",
        "secret": "eb6952d6ef"
      },
      {
        "username": "user_31c461633a",
        "secret": "304474639a"
      },
      {
        "username": "user_15cab786db",
        "secret": "0d01efbc3c"
      }
    ]
  }
};
var peers = manual.credentials.peers;
console.log('loading hardcoded peers');
var users = null;																		//users are only found if security is on
if(manual.credentials.users) users = manual.credentials.users;
console.log('loading hardcoded users');

if(process.env.VCAP_SERVICES){															//load from vcap, search for service, 1 of the 3 should be found...
	var servicesObject = JSON.parse(process.env.VCAP_SERVICES);
	for(var i in servicesObject){
		if(i.indexOf('ibm-blockchain') >= 0){											//looks close enough
			if(servicesObject[i][0].credentials && servicesObject[i][0].credentials.peers){
				console.log('overwritting peers, loading from a vcap service: ', i);
				peers = servicesObject[i][0].credentials.peers;
				if(servicesObject[i][0].credentials.users){
					console.log('overwritting users, loading from a vcap service: ', i);
					users = servicesObject[i][0].credentials.users;
				} 
				else users = null;														//no security
				break;
			}
		}
	}
}


// ==================================
// configure obc-js sdk
// ==================================
var options = 	{
					network:{
						peers: peers,
						users: users,
					},
					chaincode:{
						zip_url: 'https://github.com/ibm-blockchain/marbles-chaincode/archive/master.zip',
						git_dir: 'marbles-chaincode-master/phase2',													//subdirectroy name of chaincode after unzipped
						git_url: 'https://github.com/ibm-blockchain/marbles-chaincode/phase2',						//git clone http url
						
						//hashed cc name from prev deployment
						deployed_name: 'f6c084c42b3bde90c03f214ac6e0426e3e594807901fb1464287f2c3a18ade717bc495298958287594f81bb0d0cfdd3b4346d438d3b587d4fc73cf78ae8f7dfe'
					}
				};
if(process.env.VCAP_SERVICES){
	console.log('\n[!] looks like you are in bluemix, I am going to clear out the deploy_name so that it deploys new cc.\n[!] hope that is ok budddy\n');
	options.deployed_name = "";
}
obc.load(options, cb_ready);															//parse/load chaincode

function cb_ready(err, cc){																//response has chaincode functions
	part1.setup(obc, cc);
	part2.setup(obc, cc);
	if(cc.details.deployed_name === ""){												//decide if i need to deploy
		cc.deploy('init', ['99'], './cc_summaries', cb_deployed);
	}
	else{
		console.log('chaincode summary file indicates chaincode has been previously deployed');
		cb_deployed();
	}
}

// ============================================================================================================================
// 												WebSocket Communication Madness
// ============================================================================================================================
function cb_deployed(e, d){
	if(e != null){
		//look at tutorial_part1.md in the trouble shooting section for help
		console.log('! looks like a deploy error, holding off on the starting the socket\n', e);
	}
	else{
		console.log('------------------------------------------ Websocket Up ------------------------------------------');
		obc.save('./cc_summaries');															//save it here for chaincode investigator
		wss = new ws.Server({server: server});												//start the websocket now
		wss.on('connection', function connection(ws) {
			ws.on('message', function incoming(message) {
				console.log('received ws msg:', message);
				var data = JSON.parse(message);
				part1.process_msg(ws, data);
				part2.process_msg(ws, data);
			});
			
			ws.on('close', function(){
				part2.close();																//close peridic poll that part 2 does
			});
		});
	}
}
