// Create the configuration
var config = {
	botName: "TimeTurnerBot",
	userName: "TimeTurnerBot",
    realName: "TimeTurnerBot",
	channels: ["#bots", "#teenagers", "#lgbteens", "#programming", "#justchat", "#chat"],
	server: "irc.awfulnet.org"
};

var extconf = require('./config.json');

// Get the lib
var irc = require("irc");
	request = require("request");
	dateutil = require("dateutil");
	fs = require("fs");
	winston = require("winston");

/*	
var allLog = new (winston.Logger)({
   transports: [
     new (winston.transports.Console)(),
     new (winston.transports.File)({ filename: 'logs/all_out.log' })
   ]
});
*/
var cityLog = new (winston.Logger)({
   transports: [
     new (winston.transports.Console)(),
     new (winston.transports.File)({ filename: 'logs/city_out.log' })
   ]
});

// Create the bot name
var bot = new irc.Client(config.server, config.realName, {
	channels: config.channels
});

var user_tz = {};
var pass = 0;

process.stdin.resume();

//Read from user file list 
fs.readFile("user_tz.json", function(err, data) {
user_tz = JSON.parse(data);
});

//If script is closed, save file
process.on('SIGINT', function() {
fs.writeFileSync("user_tz.json", JSON.stringify(user_tz, null, 4));
process.exit(0);
});
 
//Save file every 2 mins (as this runs 24/7, so shouldn't be quit)
setInterval(function() {
fs.writeFileSync("user_tz.json", JSON.stringify(user_tz, null, 4));
}, 240 * 1000);


//Listen for messages
bot.addListener('join', function(channel, who, message) {
// create basic stats for channel
})


bot.addListener('registered', function(message) {
	bot.say("NickServ", "identify " + extconf.username + " " + extconf.password); // Authenticate as TimeBot
	bot.send('UMODE2', '+B'); // Register as a bot
	
})

//bot.addListener('message', function (from, to, message) {
    //allLog.info(from + ' => ' + to + ': ' + message); // Log all channel activity, for fun?
//});

//The main bot, listen for all messages sent to channel
bot.addListener('message', function(from, to, message) {
		
		var splitmsg = message.split(" "); // Split spaces to get the different components of the message
		
		var cmd = splitmsg[0].toLowerCase(); //Get our command
		
		
		if (cmd == '!time') { // !time command
			//bot.say(to, "Working...");
			
			var cityname=message.replace(splitmsg[0],"");
			var cityname=cityname.trim();
			
			cityLog.info(cityname);
			
			if (cityname=="help") {
				bot.say(to, "TimeBot Help. Use: !time <city>    Contact will for further information.");
			
			} else if (cityname=="future" || cityname=="the future") {
			
				bot.say(to, "I'm sorry Dave, I'm afraid I can't do that.");
				
			} else if (cityname=="more") {
			
				bot.say(to, "'What we need,' said Dumbledore slowly, and his light-blue eyes moved from Harry to Hermione, 'is more time'... 'Miss Granger, three turns should do it. Good luck.'");
			
			} else if (cityname=="past" || cityname=="the past") {
			
				bot.say(to, "'The past is a construct of the mind. It blinds us. It fools us into believing it. But the heart wants to live in the present. Look there. You'll find your answer.'");
				
			} else if (cityname=="wiki") {
			
				bot.say(to, "Wiki Page: http://wiki.awfulnet.org/w/TimeBot");
			
			} else if (cityname=="now" || cityname=="TimeBot" || cityname=="timebot") {
			
				var servertime = new Date();
				
				var hours = servertime.getHours()
				var minutes = servertime.getMinutes()
				
				if (minutes < 10){
					minutes = "0" + minutes
				}
				var mainTime = hours + ":" + minutes + " "
				if(hours > 11){
					var amPM = "PM";
				} else {
					var amPM = "AM";
				}
			
				var servertimeFinal = mainTime + amPM
				
				bot.say(to, "TimeBot Server Time: " + servertimeFinal);
				
			
			} else {
			
			pass = 0;
			
			var internaluser = cityname.toLowerCase();
			
			if (internaluser in user_tz) {
				var calleduser = cityname;
				cityname = user_tz[internaluser];
				pass = 1;
			}
			
			var url="http://api.worldweatheronline.com/free/v1/tz.ashx?q=" + cityname + "&format=json&key=" + extconf.apikey;
			
			request(url, function(error, response, body) {
				  if (!error && response.statusCode == 200) {
					  var jsonobj = JSON.parse(body);
					  
					  	if (jsonobj.data.hasOwnProperty('error')) {
						  		bot.say(to, "Error, the time could not be given for the city/person you requested.");
						} else {
								var timeUnformat = jsonobj.data.time_zone[0].localtime;
								var timeFormat = dateutil.parse(timeUnformat);
								var timeFormatFinal = dateutil.format(timeFormat, "l jS F Y H:i");
								if (pass == 0) {
						  			bot.say(to, "The time in " + cityname + " is " + timeFormatFinal);
						  		} else {
							  		bot.say(to, "The time where " + calleduser + " lives (" + cityname + ") is " + timeFormatFinal);
						  		}
						}
					  
					  } else {
						  bot.say(to, "Error, the time could not be given for the city/person you requested.");
					  }
					  
			});
		}
		}
		
		// !addtz data
		
		if (cmd == '!addtz') {
			//bot.say(to, "Working...");
			var timezone=message.replace(splitmsg[0],"");
			var timezone=timezone.trim();
			var user=from.toLowerCase(); //This is just to neaten things up
			
			console.log(timezone);
			
			if (timezone=="help") {
				bot.say(to, "TimeBot Help. Use: !addtz <city>   Contact will for further information.");
			
			} else if (timezone=="future" || cityname=="the future") {
			
				bot.notice(from, "I'm sorry " + from + ", I'm afraid I can't do that.");
			
			} else if (timezone=="now") {
			
				bot.notice(from, "GLITCH IN THE MATRIX!");
				
			} else {
				// Looks like they passed some BG checks, lets goooooo....
				
				if (!(user in user_tz)) {
					user_tz[user] = timezone;
					bot.notice(from, "Timezone added");
				} else {
					user_tz[user] = timezone;
					bot.notice(from, "Timezone updated");
				}
			}
		}
		
		
		//Help command
		
		if (cmd == "help" && (to == "TimeBot" || to == "timebot" || to == "TimeTurnerBot" || to == "timeturnerbot")) {
	    	bot.say(from, "TimeBot Help:");
	    	bot.say(from, "Use !addtz <location> to add your location to TimeBot");
	    	bot.say(from, "Use !time <location/person> to see the time in <location> or where <person> lives.");
	    	
    	}
    	
    	if (cmd == "tbmsg" && from == "will" && to == "TimeTurnerBot" && splitmsg[1] == extconf.speakpw) {
	    	var tbmsg=message.replace(splitmsg[0],""); //Gets rid of command and channel
	    	var tbmsg=tbmsg.replace(splitmsg[1],""); //Gets rid of command and channel
	    	var tbmsg=tbmsg.replace(splitmsg[2],""); //Gets rid of command and channel
			var tbmsg=tbmsg.trim();
			var channel=splitmsg[2].toLowerCase(); //Gets channel
			var channel=channel.trim(); //Cleans up channel
			var tbmsg=tbmsg.trim();
			
			if (channel.charAt(0) == "#") {
				bot.say(channel, tbmsg);
				
			} else {
				bot.say(from, "Error!");
				bot.say(from, "Syntax: /msg TimeTurnerBot tbmsg <password> <#channel> <message>");
			}			
	    	
    	}

});

