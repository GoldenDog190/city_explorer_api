//==========Packages===============
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');

//=========Global Variables=======
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());


//==========Routes================

//==location==
app.get('/location', (request, response) =>{
  //const jsonObj = require('./data/location.json');
  // console.log(jsonObj);
  const city = request.query.city;
  const locationKey = process.env.LOCATION_IQ_API_KEY;
  const thingToSearchFor = request.query.city;
  const urlToSearch = `https://us1.locationiq.com/v1/search.php?key=${locationKey}&q=${thingToSearchFor}&format=json`;

  superagent.get(urlToSearch)
  .then(locationComeBack => {
    const superagentResultArr = locationComeBack.body;
    
    const constructedLocation = new Location(superagentResultArr, city);
    response.send(constructedLocation);

   // console.log('this is being sent from/location to client :', constructedLocation);
  })
  
  //==error message==
  .catch(error => {
    //console.log(error);
    response.status(500).send(error.message);
  });
  //=================
});

//==weather==
app.get('/weather', sendWeatherData);
function sendWeatherData(request, response){
  
  const latitude = request.query.latitude;
  const longitude = request.query.longitude;
  
  const weatherKey = process.env.WEATHER_API_KEY;
  const urlToWeather = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${weatherKey}`;
  
  superagent.get(urlToWeather)
  
  .then(weatherComeBack => {
    const jsonWeatherObj = weatherComeBack.body.data;
    
    const newWeatherArr = jsonWeatherObj.map(index => {
      console.log(index);
      return new Weather(index);
    
    })
   console.log(newWeatherArr);

    response.send(newWeatherArr);
    
  })
  //==error message==
  .catch(error => {
    //console.log(error);
    response.status(500).send(error.message);
  });
 //========

}

//======trails===========



//=======Constructor and 0ther Functions========

//==location constructor==

function Location(jsonObj, city){
  //console.log(jsonObj);

  this.latitude = jsonObj[0].lat;
  this.longitude = jsonObj[0].lon;
  this.formatted_query = jsonObj[0].display_name;
  this.search_query = city;
}

//==weather constructor==

function Weather(jsonWeatherObj){
  //console.log(jsonWeatherObj);

  this.forecast = jsonWeatherObj.weather.description;
  this.time = jsonWeatherObj.datetime;

}

//==trail constructor====



//==========Start the server======

app.listen(PORT, () => console.log(`running on PORT : ${PORT}`));