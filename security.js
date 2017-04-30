/*
	1. State checking and version checking
	2. JSON checking
	3. MongoDB/RedisDB injection checking
	4. XSS/CSRF checking
	5. Auth checking
*/

//Global variables
module.exports = {
  checking : function(input_json,checking_json_array,callback){
    checking(input_json,checking_json_array,callback);
  },
  change_state : function(state){
    change_state(state);
  },
  get_state : function(){
    return get_state();
  }
}

var language_data = require('./language');
var db = require('./db');

var version = "1.0";

//set variables
var server_state = false;
language_data.read_language();
var language = language_data.get_language();

var concat_JSON = function(first_JSON,second_JSON){
	var return_JSON = {};
	for(var key in first_JSON){
		return_JSON[key] = first_JSON[key];
	}
	for(var key in second_JSON){
		return_JSON[key] = second_JSON[key];
	}
	return return_JSON;
};

var checking = function(input_json,checking_json_array,callback){
	//performance.start();
	try{
		var result = {};
		result["auth"] = "yes";
		result["state"] = "0";
		checking_json_array['language'] = 1;
		checking_json_array['version'] = 1;
		var user_language = get_user_language(input_json);

		if(server_state){
			if(input_json['version']&&input_json['version']==version){
				JSON_checking(input_json,checking_json_array,user_language,function(Invalid_Input){
					if(!Invalid_Input){
						mongodb_injection_checking(input_json,checking_json_array,user_language,function(Invalid_Input){
							if(!Invalid_Input){
								XSS_CSRF_checking(input_json,checking_json_array,user_language,function(Invalid_Input){
									if(!Invalid_Input){
										auth_checking(input_json,checking_json_array,user_language,function(Invalid_login){
											if(Invalid_login.state == "0"){
												callback(Invalid_login);
											}else{
												callback(Invalid_login);
											}
										});
									}else{
										callback(Invalid_Input);
									}
								});
							}else{
								callback(Invalid_Input);
							}
						});
					}else{
						callback(Invalid_Input);
					}
				});
			}else{
				result["state"] = language[user_language]["Please_update"];
				callback(result);
			}
		}else{
			result["state"] = language[user_language]["The_server_is_offline"];
			callback(result);
		}
	}catch(err){
		console.log(err);
	}
}

var get_user_language = function(input_json){
	try{
		var user_language = "English";
		if(input_json.language){
			user_language = input_json.language;
			if(!language[user_language]){
				user_language = "English";
			}
		}
		return user_language;
	}catch(err){
		console.log(err);
	}
}

var JSON_checking = function(input_json,checking_json_array,user_language,callback){
	try{
		var match_checking = true;
		for(var key in checking_json_array){
			if((!input_json[key])&&checking_json_array[key]==1){
				match_checking = false;
				break;
			}
		}
		if(match_checking){
			callback(null);
		}else{
			var result = {};
			result["state"] = language[user_language]["Invalid_Input"];
			result["auth"] = "yes";
			callback(result);
		}
	}catch(err){
		console.log(err);
	}
}

var mongodb_injection_checking = function(input_json,checking_json_array,user_language,callback){
	try{
		if((typeof(input_json.login_id)=="string")&&(typeof(input_json.cert)=="string")){
			callback(null);
		}else{
			var result = {};
			result["state"] = language[user_language]["Invalid_Input"];
			result["auth"] = "yes";
			callback(result);
		}
	}catch(err){
		console.log(err);
	}
}

var XSS_CSRF_checking = function(input_json,checking_json_array,user_language,callback){
	try{
		var result = {};
		var vaild = true;
		for(var key in checking_json_array){
			if(input_json[key].indexOf("<")!="-1"){
				var result = {};
				result["state"] = language[user_language]["Invalid_Input"];
				result["auth"] = "yes";
				vaild = false;
				break;
			}
		}
		if(vaild){
			callback(null);
		else{
			callback(result);
		}
	}catch(err){
		console.log(err);
	}
}

var auth_checking = function(input_json,checking_json_array,user_language,callback){
	try{
		var projection = {"username":1,"password":1};
		db.read('user',{"username":input_json.username},projection,function(err,doc){
			if(doc){
				if((input_json.cert==doc.cert)&&(input_json.login_id==doc.login_id)){
					doc['language'] = user_language;
					doc["state"] = "0";
					doc["auth"] = "yes";
					callback(doc);
				}else{
					var result = {};
					result['language'] = user_language;
					result["state"] = language[user_language]["Please_login_again"];
					result["auth"] = "no";
					callback(result);
				}
			}else{
				var result = {};
				result['language'] = user_language;
				result["state"] = language[user_language]["No_user_is_found"];
				result["auth"] = "no";
				result["user"] = 0;
				callback(result);
			}
		});
	}catch(err){
		console.log(err);
	}
}

var change_state = function(state){
	server_state = state;
	console.log("Server State: " + state);
}

var get_state = function(){
	return server_state;
}
