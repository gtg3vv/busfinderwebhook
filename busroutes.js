//dictionary mapping route --> route number
 
 
//Gets the wait time for the next inner loop bus at bus stop Alderman @ AFC
// 'use strict';

var request = require("request");
var promises = require("promises");
var cheerio = require('cheerio');

const express = require('express');
const bodyParser = require('body-parser');

const restService = express();

restService.set('port',process.env.PORT || 8080);


restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());


restService.post('/uvabus', function(req, res) {
    if (req.body.result && req.body.result.parameters && req.body.result.parameters.busstop)
    {
        var stop = req.body.result.parameters.busstop;
        getAnswer(stop,function(val){
            return res.json({
            speech: val,
            displayText: val,
            source: 'uva-bus-webhook'
        });

    });
    }
    else{
        return res.json({
        speech: "Seems like some problem. Speak again.",
        displayText: "Seems like some problem. Speak again.",
        source: 'uva-bus-webhook'
    });

    }
    
});
restService.listen(restService.get('port'),function(){
    console.log('service started...');
});
/*
//this will always finish first
function getStopCode(stopsearch,callback){
    var searchurl="http://uva.transloc.com/m/search?s="+stopsearch;
    var stopcode;
 
    request({
        uri: searchurl,
    }, function(error, response, body) {
        $ = cheerio.load(body);
        stopcode=$('.posted').text().substring(11,14);
        return callback(stopcode);
    });
}
 
//make this what the user says
var argument="ohill";
 
//this will always finish second
getStopCode(argument,function(val){
    request({
        uri:"http://uva.transloc.com/m/stop/code/"+val,
    }, function(error, response, body) {
        var dict = {
            "Inner U-Loop": 4003290,
            "Northline": 4003286,
            "Outer U-Loop": 4003294
        };
        var cheerio = require('cheerio'), $ = cheerio.load(body);
        for(var key in dict){
            var route="#route_" + dict[key];
            if($('.wait_time', route).text()!==""){
                console.log("The " + key + " will arrive in");
                console.log($('.wait_time', route).text());
            }
            else{
                console.log("The " + key + " does not come to this stop.");
            }
        }
    });
});*/
function getStopCode(stopsearch, callback){
  var searchurl="http://uva.transloc.com/m/search?s="+stopsearch;
  var stopcode;

  request({
    uri: searchurl,
  }, function(error, response, body) {
    var $ = cheerio.load(body);
    stopcode=$('.posted').text().substring(11,14);
    callback(stopcode);
  });
}

//actual google home part
function getAnswer(argument,callback){
  getStopCode(argument,function(val){
  request({
      uri:"http://uva.transloc.com/m/stop/code/"+val,
  }, function(error, response, body) {
    var dict = {
      "Inner U-Loop": 4003290,
      "Northline": 4003286,
      "Outer U-Loop": 4003294
    };
    var response = "Stop " + val;
    var cheerio = require('cheerio'), $ = cheerio.load(body);
    for(var key in dict){
      var route="#route_" + dict[key]
      if($('.wait_time', route).text()!=""){
        response += "\nThe " + key + " will arrive in";
        response += $('.wait_time', route).text();
      }
      else{
        response += "\nThe " + key + " does not come to this stop.";
      }

    }
    callback(response);


  });


});
}
