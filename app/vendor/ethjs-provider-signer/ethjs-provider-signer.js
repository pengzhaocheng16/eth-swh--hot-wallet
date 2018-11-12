/* eslint-disable */ 
 /* eslint-disable */ 
 (function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("SignerProvider", [], factory);
	else if(typeof exports === 'object')
		exports["SignerProvider"] = factory();
	else
		root["SignerProvider"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var HTTPProvider = __webpack_require__(1);
var EthRPC = __webpack_require__(2);

module.exports = SignerProvider;

/**
 * Signer provider constructor
 *
 * @method SignerProvider
 * @param {String} path the input data payload
 * @param {Object} options the send async callback
 * @returns {Object} provider instance
 */
function SignerProvider(path, options) {
  if (!(this instanceof SignerProvider)) {
    throw new Error('[ethjs-provider-signer] the SignerProvider instance requires the "new" flag in order to function normally (e.g. `const eth = new Eth(new SignerProvider(...));`).');
  }
  if (typeof options !== 'object') {
    throw new Error('[ethjs-provider-signer] the SignerProvider requires an options object be provided with the \'privateKey\' property specified, you provided type ' + typeof options + '.');
  }
  if (typeof options.signTransaction !== 'function') {
    throw new Error('[ethjs-provider-signer] the SignerProvider requires an options object be provided with the \'signTransaction\' property specified, you provided type ' + typeof options.privateKey + ' (e.g. \'const eth = new Eth(new SignerProvider("http://ropsten.infura.io", { privateKey: (account, cb) => cb(null, \'some private key\') }));\').');
  }

  var self = this;
  self.options = Object.assign({
    provider: HTTPProvider
  }, options);
  self.timeout = options.timeout || 0;
  self.provider = new self.options.provider(path, self.timeout); // eslint-disable-line
  self.rpc = new EthRPC(self.provider);
}

/**
 * Send async override
 *
 * @method sendAsync
 * @param {payload} payload the input data payload
 * @param {Function} callback the send async callback
 * @callback {Object} output the XMLHttpRequest payload
 */
SignerProvider.prototype.sendAsync = function (payload, callback) {
  // eslint-disable-line
  var self = this;
  if (payload.method === 'eth_accounts' && self.options.accounts) {
    self.options.accounts(function (accountsError, accounts) {
      // create new output payload
      var inputPayload = Object.assign({}, {
        id: payload.id,
        jsonrpc: payload.jsonrpc,
        result: accounts
      });

      callback(accountsError, inputPayload);
    });
  } else if (payload.method === 'eth_sendTransaction') {
    // get the nonce, if any
    var from = payload.params[0].from;
    self.rpc.sendAsync({ method: 'eth_getTransactionCount', params: [from, 'latest'] }, function (nonceError, nonce) {
      // eslint-disable-line
      if (nonceError) {
        return callback(new Error('[ethjs-provider-signer] while getting nonce: ' + nonceError), null);
      }

      // get the gas price, if any
      self.rpc.sendAsync({ method: 'eth_gasPrice' }, function (gasPriceError, gasPrice) {
        // eslint-disable-line
        if (gasPriceError) {
          return callback(new Error('[ethjs-provider-signer] while getting gasPrice: ' + gasPriceError), null);
        }

        // build raw tx payload with nonce and gasprice as defaults to be overriden
        var rawTxPayload = Object.assign({
          nonce: nonce,
          gasPrice: gasPrice
        }, payload.params[0]);

        // get the tx inputs outputs, if any
        var HexStringToInt64StringConverter = function (signed) {
          var hexCode = {
            '0':"0000",
            '1':"0001",
            '2':"0010",
            '3':"0011",
            '4':"0100",
            '5':"0101",
            '6':"0110",
            '7':"0111",
            '8':"1000",
            '9':"1001",
            'a':"1010",
            'b':"1011",
            'c':"1100",
            'd':"1101",
            'e':"1110",
            'f':"1111"
          };
          var preComputedLongMath = {
            "20":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            "21":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            "22":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            "23":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
            "24":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 6],
            "25":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            "26":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 4],
            "27":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 8],
            "28":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 5, 6],
            "29":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1, 2],
            "210":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 4],
            "211":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 4, 8],
            "212":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 9, 6],
            "213":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1, 9, 2],
            "214":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 6, 3, 8, 4],
            "215":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 7, 6, 8],
            "216":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 5, 5, 3, 6],
            "217":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 7, 2],
            "218":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 6, 2, 1, 4, 4],
            "219":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 4, 2, 8, 8],
            "220":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 4, 8, 5, 7, 6],
            "221":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 9, 7, 1, 5, 2],
            "222":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1, 9, 4, 3, 0, 4],
            "223":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 3, 8, 8, 6, 0, 8],
            "224":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 6, 7, 7, 7, 2, 1, 6],
            "225":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 5, 5, 4, 4, 3, 2],
            "226":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 7, 1, 0, 8, 8, 6, 4],
            "227":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 4, 2, 1, 7, 7, 2, 8],
            "228":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 6, 8, 4, 3, 5, 4, 5, 6],
            "229":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 3, 6, 8, 7, 0, 9, 1, 2],
            "230":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 7, 3, 7, 4, 1, 8, 2, 4],
            "231":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 4, 7, 4, 8, 3, 6, 4, 8],
            "232":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 9, 4, 9, 6, 7, 2, 9, 6],
            "233":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 5, 8, 9, 9, 3, 4, 5, 9, 2],
            "234":[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 1, 7, 9, 8, 6, 9, 1, 8, 4],
            "235":[0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 3, 5, 9, 7, 3, 8, 3, 6, 8],
            "236":[0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 8, 7, 1, 9, 4, 7, 6, 7, 3, 6],
            "237":[0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 7, 4, 3, 8, 9, 5, 3, 4, 7, 2],
            "238":[0, 0, 0, 0, 0, 0, 0, 0, 2, 7, 4, 8, 7, 7, 9, 0, 6, 9, 4, 4],
            "239":[0, 0, 0, 0, 0, 0, 0, 0, 5, 4, 9, 7, 5, 5, 8, 1, 3, 8, 8, 8],
            "240":[0, 0, 0, 0, 0, 0, 0, 1, 0, 9, 9, 5, 1, 1, 6, 2, 7, 7, 7, 6],
            "241":[0, 0, 0, 0, 0, 0, 0, 2, 1, 9, 9, 0, 2, 3, 2, 5, 5, 5, 5, 2],
            "242":[0, 0, 0, 0, 0, 0, 0, 4, 3, 9, 8, 0, 4, 6, 5, 1, 1, 1, 0, 4],
            "243":[0, 0, 0, 0, 0, 0, 0, 8, 7, 9, 6, 0, 9, 3, 0, 2, 2, 2, 0, 8],
            "244":[0, 0, 0, 0, 0, 0, 1, 7, 5, 9, 2, 1, 8, 6, 0, 4, 4, 4, 1, 6],
            "245":[0, 0, 0, 0, 0, 0, 3, 5, 1, 8, 4, 3, 7, 2, 0, 8, 8, 8, 3, 2],
            "246":[0, 0, 0, 0, 0, 0, 7, 0, 3, 6, 8, 7, 4, 4, 1, 7, 7, 6, 6, 4],
            "247":[0, 0, 0, 0, 0, 1, 4, 0, 7, 3, 7, 4, 8, 8, 3, 5, 5, 3, 2, 8],
            "248":[0, 0, 0, 0, 0, 2, 8, 1, 4, 7, 4, 9, 7, 6, 7, 1, 0, 6, 5, 6],
            "249":[0, 0, 0, 0, 0, 5, 6, 2, 9, 4, 9, 9, 5, 3, 4, 2, 1, 3, 1, 2],
            "250":[0, 0, 0, 0, 1, 1, 2, 5, 8, 9, 9, 9, 0, 6, 8, 4, 2, 6, 2, 4],
            "251":[0, 0, 0, 0, 2, 2, 5, 1, 7, 9, 9, 8, 1, 3, 6, 8, 5, 2, 4, 8],
            "252":[0, 0, 0, 0, 4, 5, 0, 3, 5, 9, 9, 6, 2, 7, 3, 7, 0, 4, 9, 6],
            "253":[0, 0, 0, 0, 9, 0, 0, 7, 1, 9, 9, 2, 5, 4, 7, 4, 0, 9, 9, 2],
            "254":[0, 0, 0, 1, 8, 0, 1, 4, 3, 9, 8, 5, 0, 9, 4, 8, 1, 9, 8, 4],
            "255":[0, 0, 0, 3, 6, 0, 2, 8, 7, 9, 7, 0, 1, 8, 9, 6, 3, 9, 6, 8],
            "256":[0, 0, 0, 7, 2, 0, 5, 7, 5, 9, 4, 0, 3, 7, 9, 2, 7, 9, 3, 6],
            "257":[0, 0, 1, 4, 4, 1, 1, 5, 1, 8, 8, 0, 7, 5, 8, 5, 5, 8, 7, 2],
            "258":[0, 0, 2, 8, 8, 2, 3, 0, 3, 7, 6, 1, 5, 1, 7, 1, 1, 7, 4, 4],
            "259":[0, 0, 5, 7, 6, 4, 6, 0, 7, 5, 2, 3, 0, 3, 4, 2, 3, 4, 8, 8],
            "260":[0, 1, 1, 5, 2, 9, 2, 1, 5, 0, 4, 6, 0, 6, 8, 4, 6, 9, 7, 6],
            "261":[0, 2, 3, 0, 5, 8, 4, 3, 0, 0, 9, 2, 1, 3, 6, 9, 3, 9, 5, 2],
            "262":[0, 4, 6, 1, 1, 6, 8, 6, 0, 1, 8, 4, 2, 7, 3, 8, 7, 9, 0, 4],
            "263":[0, 9, 2, 2, 3, 3, 7, 2, 0, 3, 6, 8, 5, 4, 7, 7, 5, 8, 0, 8],
            "264":[1, 8, 4, 4, 6, 7, 4, 4, 0, 7, 3, 7, 0, 9, 5, 5, 1, 6, 1, 6],
            "265":[3, 6, 8, 9, 3, 4, 8, 8, 1, 4, 7, 4, 1, 9, 1, 0, 3, 2, 3, 2]
          };
          if (typeof(signed) != 'boolean') signed = false;
          function toBinary(hex) {
            hex = hex.toLowerCase();
            var binary = "";
            for (var i = 0; i < hex.length; i++) {
              binary += hexCode[hex[i]];
            }
            return binary;
          }

          function to1nsComplement(binary) {
            var compliment = "";
            for (var i = 0; i < binary.length; i++) {
              compliment += (binary.charAt(i) == "1" ? "0" : "1");
            }
            return compliment;
          }

          function arrayAdd(a, b) {
            var carry = 0;
            var number = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (var i = 19; i >= 0; i--) {
              number[i] = a[i] + b[i] + carry;
              if (number[i].toString().length > 1) {
                carry = parseInt(number[i].toString().substring(0, number[i].toString().length - 1), 10);
                number[i] = parseInt(number[i].toString().substring(number[i].toString().length - 1), 10)
              } else {
                carry = 0;
              }
            }
            return number;
          }

          function removeZeroPad(number) {
            var lock = false;
            var output = [];
            for (var i = 0; i < number.length; i++) {
              if (lock) {
                output.push(number[i]);
              } else {
                if (number[i] != 0) {
                  lock = true;
                  output.push(number[i]);
                }
              }
            }
            return output;
          }

          function binaryToDec(binary) {
            var negative = false;
            if (signed && (binary.charAt(0) == 1)) {
              negative = true;
            }
            if (signed) {
              binary = binary.substring(1);
              if (negative) {
                binary = to1nsComplement(binary);
              }
            }
            var pos = 0;
            var number = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (var i = binary.length - 1; i >= 0; i--) {
              if (binary.charAt(i) == 1) {
                number = arrayAdd(number, preComputedLongMath["2" + pos])
              }
              pos++;
            }
            if (negative) {
              number = removeZeroPad(arrayAdd(number, preComputedLongMath["20"]));
              number.splice(0, 0, "-");
            } else {
              number = removeZeroPad(number);
            }
            return number.join("");
          }

          this.convert = function (hex) {
            var binary = toBinary(hex);
            return binaryToDec(binary);
          };
        };
        var value = new HexStringToInt64StringConverter(true).convert(payload.params[0].value.substring(2))
        value = value/10000000000;
        var from = payload.params[0].from;
        var to = payload.params[0].to;
        self.rpc.sendAsync({ method: 'eth_getTxInOuts' , params: [from,to,value ] }, function (getInOutError, InOuts) {
          // eslint-disable-line
          if (getInOutError) {
            console.error('[ethjs-provider-signer] while getting TxInputOutputs: ' + getInOutError);
            //return callback(new Error('[ethjs-provider-signer] while getting TxInputOutputs: ' + getInOutError), null);
          }
          if(InOuts){
            console.log("InOuts:"+InOuts['inputs'])
            rawTxPayload  = Object.assign({
              inputs: InOuts['inputs'],
              outputs: InOuts['outputs']
            }, rawTxPayload);
          }
          console.log("inputs:"+rawTxPayload.inputs);
          //TODO: chainType set to method prefix
          let chainType = "eth";
          if(rawTxPayload.inputs || rawTxPayload.outputs){
            chainType = "swh";
          }

          // sign transaction with raw tx payload
          self.options.signTransaction(rawTxPayload,chainType, function (keyError, signedHexPayload) {
            // eslint-disable-line
            if (!keyError) {
              // create new output payload
              var outputPayload = Object.assign({}, {
                id: payload.id,
                jsonrpc: payload.jsonrpc,
                method: 'eth_sendRawTransaction',
                params: [signedHexPayload]
              });

              // send payload
              self.provider.sendAsync(outputPayload, callback);
            } else {
              //callback(new Error('[ethjs-provider-signer] while signing your transaction payload: ' + JSON.stringify(keyError)), null);
              console.error('[ethjs-provider-signer] while signing your transaction payload:', keyError);
              callback(keyError, null);
            }
          });
        });//end gettxinouts
      });
    });
  } else {
    self.provider.sendAsync(payload, callback);
  }
};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

/**
 * @original-authors:
 *   Marek Kotewicz <marek@ethdev.com>
 *   Marian Oancea <marian@ethdev.com>
 *   Fabian Vogelsteller <fabian@ethdev.com>
 * @date 2015
 */

// workaround to use httpprovider in different envs
var XHR2 = __webpack_require__(3);

/**
 * InvalidResponseError helper for invalid errors.
 */
function invalidResponseError(result, host) {
  var message = !!result && !!result.error && !!result.error.message ? '[ethjs-provider-http] ' + result.error.message : '[ethjs-provider-http] Invalid JSON RPC response from host provider ' + host + ': ' + JSON.stringify(result, null, 2);
  return new Error(message);
}

/**
 * HttpProvider should be used to send rpc calls over http
 */
function HttpProvider(host, timeout) {
  if (!(this instanceof HttpProvider)) {
    throw new Error('[ethjs-provider-http] the HttpProvider instance requires the "new" flag in order to function normally (e.g. `const eth = new Eth(new HttpProvider());`).');
  }
  if (typeof host !== 'string') {
    throw new Error('[ethjs-provider-http] the HttpProvider instance requires that the host be specified (e.g. `new HttpProvider("http://localhost:8545")` or via service like infura `new HttpProvider("http://ropsten.infura.io")`)');
  }

  var self = this;
  self.host = host;
  self.timeout = timeout || 0;
}

/**
 * Should be used to make async request
 *
 * @method sendAsync
 * @param {Object} payload
 * @param {Function} callback triggered on end with (err, result)
 */
HttpProvider.prototype.sendAsync = function (payload, callback) {
  // eslint-disable-line
  var self = this;
  var request = new XHR2(); // eslint-disable-line

  request.timeout = self.timeout;
  request.open('POST', self.host, true);
  request.setRequestHeader('Content-Type', 'application/json');

  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.timeout !== 1) {
      var result = request.responseText; // eslint-disable-line
      var error = null; // eslint-disable-line

      try {
        result = JSON.parse(result);
      } catch (jsonError) {
        error = invalidResponseError(request.responseText, self.host);
      }

      callback(error, result);
    }
  };

  request.ontimeout = function () {
    callback('[ethjs-provider-http] CONNECTION TIMEOUT: http request timeout after ' + self.timeout + ' ms. (i.e. your connect has timed out for whatever reason, check your provider).', null);
  };

  try {
    request.send(JSON.stringify(payload));
  } catch (error) {
    callback('[ethjs-provider-http] CONNECTION ERROR: Couldn\'t connect to node \'' + self.host + '\': ' + JSON.stringify(error, null, 2), null);
  }
};

module.exports = HttpProvider;

/***/ },
/* 2 */
/***/ function(module, exports) {

"use strict";
'use strict';

module.exports = EthRPC;

/**
 * Constructs the EthRPC instance
 *
 * @method EthRPC
 * @param {Object} cprovider the eth rpc provider web3 standard..
 * @param {Object} options the options, if any
 * @returns {Object} ethrpc instance
 */
function EthRPC(cprovider, options) {
  var self = this;
  var optionsObject = options || {};

  if (!(this instanceof EthRPC)) {
    throw new Error('[ethjs-rpc] the EthRPC object requires the "new" flag in order to function normally (i.e. `const eth = new EthRPC(provider);`).');
  }

  self.options = Object.assign({
    jsonSpace: optionsObject.jsonSpace || 0,
    max: optionsObject.max || 9999999999999
  });
  self.idCounter = Math.floor(Math.random() * self.options.max);
  self.setProvider = function (provider) {
    if (typeof provider !== 'object') {
      throw new Error('[ethjs-rpc] the EthRPC object requires that the first input \'provider\' must be an object, got \'' + typeof provider + '\' (i.e. \'const eth = new EthRPC(provider);\')');
    }

    self.currentProvider = provider;
  };
  self.setProvider(cprovider);
}

/**
 * The main send async method
 *
 * @method sendAsync
 * @param {Object} payload the rpc payload object
 * @param {Function} cb the async standard callback
 * @callback {Object|Array|Boolean|String} vary result instance output
 */
EthRPC.prototype.sendAsync = function sendAsync(payload, cb) {
  var self = this;
  self.idCounter = self.idCounter % self.options.max;
  self.currentProvider.sendAsync(createPayload(payload, self.idCounter++), function (err, response) {
    var responseObject = response || {};

    if (err || responseObject.error) {
      var payloadErrorMessage = '[ethjs-rpc] ' + (responseObject.error && 'rpc' || '') + ' error with payload ' + JSON.stringify(payload, null, self.options.jsonSpace) + ' ' + (err || JSON.stringify(responseObject.error, null, self.options.jsonSpace));
      return cb(new Error(payloadErrorMessage), null);
    }

    return cb(null, responseObject.result);
  });
};

/**
 * A simple create payload method
 *
 * @method createPayload
 * @param {Object} data the rpc payload data
 * @param {String} id the rpc data payload ID
 * @returns {Object} payload the completed payload object
 */
function createPayload(data, id) {
  return Object.assign({
    id: id,
    jsonrpc: '2.0',
    params: []
  }, data);
}

/***/ },
/* 3 */
/***/ function(module, exports) {

module.exports = XMLHttpRequest;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ }
/******/ ])
});
;
//# sourceMappingURL=ethjs-provider-signer.js.map
