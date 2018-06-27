// server.js
// where your node app starts
// init project
const express = require('express');
const ApiAiAssistant = require('actions-on-google').ApiAiAssistant;
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const Map = require('es6-map');

// Pretty JSON output for logs
const prettyjson = require('prettyjson');
// Join an array of strings into a sentence
// https://github.com/epeli/underscore.string#tosentencearray-delimiter-lastdelimiter--string
const toSentence = require('underscore.string/toSentence');

app.use(bodyParser.json({type: 'application/json'}));

// This boilerplate uses Express, but feel free to use whatever libs or frameworks
// you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// Handle webhook requests
app.post('/', function(req, res, next) {
  // Log the request headers and body, to aide in debugging. You'll be able to view the
  // webhook requests coming from API.AI by clicking the Logs button the sidebar.
  logObject('Request headers: ', req.headers);
  logObject('Request body: ', req.body);
    
  // Instantiate a new API.AI assistant object.
  const assistant = new ApiAiAssistant({request: req, response: res});

  // Declare constants for your action and parameter names
  const LIST_ALIASES_ACTION = 'status';  // The action name from the API.AI intent
  const CHARECTER_PARAMETER = 'company'; // An API.ai parameter name
  const PERSON = 'person'; 
  const USER_NAME = 'sys.given-name';
  
  // Create functions to handle intents here
  function listAliases(assistant) {
    console.log('Handling action: ' + LIST_ALIASES_ACTION);
    let charecter = assistant.getArgument(CHARECTER_PARAMETER);
    
    // Make an API call to fetch the current weather in the requested city.
    // See https://developer.yahoo.com/weather/
    let requestURL = 'https://www.viewandhire.com/InterviewService/rest/alexa/getDashboardCountsByOrganization?organization=Jeanmartin%20Chennai&authType=token&authorization=fc11761deb11df77733c90018db4d16b'
    
    request(requestURL, function(error, response) {
      if(error) {
        next(error);
      } else {        
        let body = JSON.parse(response.body);
        logObject('Weather API call response: ', body);
    
        var inProgressCount = body['paramObjectsMap']['dashBoardVO']['inProgressCount'];
        var jobsCount = body['paramObjectsMap']['dashBoardVO']['jobsCount'];
        var candidateCount = body['paramObjectsMap']['dashBoardVO']['candidateCount'];
        var scheduledCount = body['paramObjectsMap']['dashBoardVO']['scheduledCount'];
        var completedCount = body['paramObjectsMap']['dashBoardVO']['completedCount'];
        var selectedCount = body['paramObjectsMap']['dashBoardVO']['selectedCount'];
        var rejectedCount = body['paramObjectsMap']['dashBoardVO']['rejectedCount'];

        
       // Respond to the user with the current temperature.
        assistant.tell(' Job Count ' + jobsCount +'.' + ' Number of candidates '+ candidateCount + '.'+ ' Interviews scheduled ' + scheduledCount + '.'+ 
                       ' Interviews in progress ' + inProgressCount + '.' + ' Interviews completed ' + completedCount + '.'+' Candidates selected ' + selectedCount +
                       '.' +' Candidates rejected ' + rejectedCount + '.');
      }
    });
  }
    function user(assistant) {
    console.log('Handling action: ' + PERSON);
    let charecter = assistant.getArgument(USER_NAME);
    
    // Make an API call to fetch the current weather in the requested city.
    // See https://developer.yahoo.com/weather/
    let requestURL = 'https://beta.viewandhire.com/InterviewService/rest/alexa/getTodayInterviewsByInterviewer?organization=Jeanmartin%20Chennai&interviewerName=gubendran&todayDate=05%2F04%2F2018&authType=token&authorization=fc11761deb11df77733c90018db4d16b'
    
    request(requestURL, function(error, response) {
      if(error) {
        next(error);
      } else {        
        let body = JSON.parse(response.body);
        logObject('Weather API call response: ', body);
    
        var candidateName = body['paramObjectsMap']['interviews'][0]['candidateName'];
       
        
       // Respond to the user with the current temperature.
        assistant.tell(' Candidate Name is' + candidateName );
      }
    });
  }
  
  // Add handler functions to the action router.
  let actionRouter = new Map();
  
  // The ASK_WEATHER_INTENT (askWeather) should map to the getWeather method.
  actionRouter.set(LIST_ALIASES_ACTION, listAliases);
  actionRouter.set(PERSON, user);

  
  // Route requests to the proper handler functions via the action router.
  assistant.handleRequest(actionRouter);
});

// Handle errors.
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// Pretty print objects for logging.
function logObject(message, object, options) {
  console.log(message);
  console.log(prettyjson.render(object, options));
}

// Listen for requests.
let server = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + server.address().port);
});

