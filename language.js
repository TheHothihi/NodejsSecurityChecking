//Files read write
var fs = require('fs');

module.exports = {
  get_language : function(){
    return get_language();
  },
  read_language : function(){
    read_language();
  }
}

var all_language = {};
var language_EN = require('./language/language_EN.json');
var language_TW = require('./language/language_TW.json');

var read_language = function(){
  all_language["English"]  = language_EN;
  all_language["繁體中文"]  = language_TW;
}

var get_language = function(){
  return all_language;
}
