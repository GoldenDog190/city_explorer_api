//==========Packages===============
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const { json } = require('express');

//=========Global Variables=======
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
const DATABASE_URL = process.env.DATABASE_URL;

//==express configs==
const client = new pg.Client(DATABASE_URL);
client.on('error', (error) => console.error(error));


//==========Routes================

//==location==
app.get('/location', getLocationIQ);

function getLocationIQ(request, response){
  //const jsonObj = require('./data/location.json');
  // console.log(jsonObj);
  const city = request.query.city;
  const locationKey = process.env.GEOCODE_API_KEY;
  const thingToSearchFor = request.query.city;
  const urlToSearch = `https://us1.locationiq.com/v1/search.php?key=${locationKey}&q=${thingToSearchFor}&format=json`;
  
  // this is begining thats searching for the database that the search query is there
  client.query('SELECT * FROM locations')
  .then(resultFromSql => {
    //console.log(resultFromSql);
    for(let i = 0; i < resultFromSql.rows.length; i++){
     let rowsSql = resultFromSql.rows[i];
     //console.log(rowsSql.search_query);
     //console.log(city);
     if(rowsSql.search_query === city){
       //console.log('found the city');
       //capture info from the database & return the info instead of going to location IQ
       //response.send(resultFromSql.rows);

     } //else { 
       //go to the location iq for information
      //respond.send(constructedLocation);
     //}
    }
  })
  
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
};


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
      //console.log(index);
      return new Weather(index);
      
    })
    //console.log(newWeatherArr);
    //newWeatherArr = newWeatherArr.slice(0, 8);

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

app.get('/trails', sendTrailData);
function sendTrailData(request, response){
  
  const latitude = request.query.latitude;
  const longitude = request.query.longitude;

  
  const trailKey = process.env.TRAIL_API_KEY;
  const urlToTrail = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&key=${trailKey}`;
  
  superagent.get(urlToTrail)
  
  .then(trailComeBack => {
    //console.log(trailComeBack.body.trails);

    const jsonTrailObj = trailComeBack.body.trails;
    
    const newTrailArr = jsonTrailObj.map(index => {
      //console.log(index);
      return new Trail(index);
    
    })
   //console.log(newTrailArr);

    response.send(newTrailArr);
    
  })
  //==error message==
  .catch(error => {
    //console.log(error);
    response.status(500).send(error.message);
  });
 //========
 
}

//=======Movies=============
app.get('/movies', sendMovieData);
function sendMovieData(request, response){
  
  const latitude = request.query.latitude;
  const longitude = request.query.longitude;

  const movieKey = process.env.MOVIE_API_KEY;
  const urlToMovie = `https://api.themoviedb.org/3/movie/76341?api_key=${movieKey}`;
  
  superagent.get(urlToMovie)
  
  .then(movieComeBack => {
    //console.log(movieComeBack.body.movie);

    const jsonMovieObj = movieComeBack.body.movie;
    //console.log(jsonMovieObj);
    const newMovieArr = jsonMovieObj.map(index => {
      //console.log(index);
      return new Movie(index);
    
    })
   //console.log(newMovieArr);

    response.send(newMovieArr);
    
  })
  //==error message==
  .catch(error => {
    //console.log(error);
    response.status(500).send(error.message);
  });
 //========
 
}

//======Yelp================
app.get('/yelp', sendYelpData);
function sendTrailData(request, response){
  
  const latitude = request.query.latitude;
  const longitude = request.query.longitude;

  
  const trailKey = process.env.TRAIL_API_KEY;
  const urlToTrail = ``;
  
  superagent.get(urlToTrail)
  
  .then(trailComeBack => {
    //console.log(trailComeBack.body.trails);

    const jsonTrailObj = trailComeBack.body.trails;
    
    const newTrailArr = jsonTrailObj.map(index => {
      //console.log(index);
      return new Trail(index);
    
    })
   //console.log(newTrailArr);

    response.send(newTrailArr);
    
  })
  //==error message==
  .catch(error => {
    //console.log(error);
    response.status(500).send(error.message);
  });
 //========
 
}

//=======Constructor and 0ther Functions========

//==location constructor==

function Location(jsonObj, city){
  this.latitude = jsonObj[0].lat;
  this.longitude = jsonObj[0].lon;
  this.formatted_query = jsonObj[0].display_name;
  this.search_query = city;
}

//==weather constructor==

function Weather(jsonWeatherObj){
  this.forecast = jsonWeatherObj.weather.description;
  this.time = jsonWeatherObj.datetime;
}

//==trail constructor====

function Trail(jsonTrailObj){
  this.name = jsonTrailObj.name;
  this.location = jsonTrailObj.location;
  this.length = jsonTrailObj.length;
  this.stars = jsonTrailObj.stars;
  this.star_votes = jsonTrailObj.star_votes;
  this.summary = jsonTrailObj.summary;
  this.trail_url = jsonTrailObj.url;
  this.conditions = jsonTrailObj.conditionStatus;
  this.condtion_date = jsonTrailObj.conditionDate;
  this.condition_time = jsonTrailObj.conditionDate;
}

//==movie constructor====

function Movie(jsonMovieObj){
//console.log(jsonMovieObj);
 this.title = jsonMovieObj;
 this.overview = jsonMovieObj;
 this.total_votes = jsonMovieObj;
 this.image_url = jsonMovieObj;
 this.popularity = jsonMovieObj;
 this.released_on = jsonMovieObj;
}

//==yelp constructor=====


//==========Listen======
client.connect()
.then(() => {
app.listen(PORT, () => console.log(`running on PORT : ${PORT}`));

});