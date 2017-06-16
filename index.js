'use strict';
var Alexa = require('alexa-sdk');
var https = require('https');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: var APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
var APP_ID = undefined;

var SKILL_NAME = "CryptoNews";
var GET_FACT_MESSAGE = "Here's your CryptoNews: ";
var HELP_MESSAGE = "You can say give me an update, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Goodbye!";

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/data
//=========================================================================================================================================
var data = [
    "Todays bitcoin price is $2430.54"
];

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var cryptoHttp = function(url, success, error) {
  https.get(url, function(response) {
    var str = '';
    response.on('data', function(chunk) {
      str += chunk;
    });

    response.on('end', function() {
      var json = JSON.parse(str);
      success(json)
    })
  }).on('error', function(e) {
    error(e);
  });
}

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetCryptoNewsIntent');
    },
    'GetCryptoNewsIntent': function () {
        var self = this;
        var host = 'https://min-api.cryptocompare.com';
        var responseMessage = '';

        console.log('Start http request to ' + host);
        cryptoHttp('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=BTC,USD,EUR,GBP', function(json) {
          responseMessage = 'Current price of crypto-currencies are: bitcoin $' + json.USD;

          cryptoHttp('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR,GBP', function(json) {
            responseMessage += ', ethereum $' + json.USD;

            cryptoHttp('https://min-api.cryptocompare.com/data/price?fsym=LTC&tsyms=BTC,USD,EUR,GBP', function(json) {
              responseMessage += ', litecoin $' + json.USD;
              var speechOutput = responseMessage;
              self.emit(':tellWithCard', speechOutput, SKILL_NAME, responseMessage);

            }, function(error) {

            })

          }, function(error) {

          })

        }, function(error) {

        })

        // https.get('https://min-api.cryptocompare.com/data/price?fsym=LTC&tsyms=BTC,USD,EUR,GBP', function(response) {
        //   console.log('response found');
        //   var str = '';
        //   response.on('data', function(chunk) {
        //     str += chunk;
        //   });
        //
        //   response.on('end', function() {
        //     var json = JSON.parse(str);
        //     var speechOutput = GET_FACT_MESSAGE + responseMessage;
        //     self.emit(':tellWithCard', speechOutput, SKILL_NAME, responseMessage);
        //   })
        // }).on('error', function(e) {
        //   console.log('http error: ' + e.message);
        //   var json = 'http error ' + e.message;
        //
        //   var speechOutput = GET_FACT_MESSAGE + json;
        //   self.emit(':tellWithCard', speechOutput, SKILL_NAME, json)
        // });
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
};
