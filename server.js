//==========Packages===============
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

//=========Global Variables=======
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
const DATABASE_URL = process.env.DATABASE_URL;

//==express configs==
const client = new pg.Client(DATABASE_URL);
client.on('error', (error) => console.error(error));


//==========Routes================
app.get('/location', getLocationIQ);
app.get('/weather', sendWeatherData);
app.get('/trails', sendTrailData);
app.get('/movies', sendMovieData);
app.get('/yelp', sendYelpData);

//================Route handlers=============

//==location==
function getLocationIQ(request, response){
  //const jsonObj = require('./data/location.json');
  // console.log('getting locations);
  const city = request.query.city;
  const locationKey = process.env.GEOCODE_API_KEY;
  const thingToSearchFor = request.query.city;
  const urlToSearch = `https://us1.locationiq.com/v1/search.php?key=${locationKey}&q=${thingToSearchFor}&format=json`;
  
  // this is begining thats searching for the database that the search query is there
  client.query('SELECT * FROM locations WHERE search_query=$1', [thingToSearchFor])
  .then(resultFromSql => {
    //console.log(resultFromSql);
     if(resultFromSql === 1){
       console.log(resultFromSql.rows[0]);
       //capture info from the database & return the info instead of going to location IQ
       response.send(resultFromSql.rows[0]);

     } else { 
       //go to the location iq for information
       superagent.get(urlToSearch)
       .then(locationComeBack => {
         const superagentResultArr = locationComeBack.body;
         
         const constructedLocation = new Location(superagentResultArr, city);
         response.send(constructedLocation);
     
        // console.log('this is being sent from/location to client :', constructedLocation);

        const saveLocationQuery = 'INSERT INTO locations (formatted_query, longitude, latitude, search_query) VALUES($1, $2, $3, $4)';
        const locationArray = [constructedLocation.formatted_query, constructedLocation.longitude, constructedLocation.latitude, constructedLocation.search_query];

        client.query(saveLocationQuery, locationArray)
        .then(() => console.log('saved location'))
        //==error message==
        .catch(error => {
          //console.log(error);
          response.status(500).send(error.message);
        });
        //=================

       })
    }
  });
};


//==weather==

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

function sendMovieData(request, response){
  
  const latitude = request.query.latitude;
  const longitude = request.query.longitude;

  const movieKey = process.env.MOVIE_API_KEY;
  const urlToMovie = `https://api.themoviedb.org/3/movie/76341?api_key=${movieKey}`;
  
  superagent.get(urlToMovie)
  
  .then(movieComeBack => {
    console.log(movieComeBack.body);

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
function sendYelpData(request, response){
  
  const latitude = request.query.latitude;
  const longitude = request.query.longitude;

  
  const yelpKey = process.env.YELP_API_KEY;
  const urlToYelp = ``;
  
  superagent.get(urlToYelp)
  
  .then(yelpComeBack => {
    //console.log(yelpComeBack.body.yelp);

    const jsonYelpObj = yelpComeBack.body.yelp;
    
    const newYelpArr = jsonYelpObj.map(index => {
      //console.log(index);
      return new Yelp(index);
    
    })
   //console.log(newYelpArr);

    response.send(newYelpArr);
    
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
 this.title = jsonMovieObj.original_title;
 this.overview = jsonMovieObj.overview;
 this.total_votes = jsonMovieObj.vote_count;
 this.image_url = jsonMovieObj.belongs_to_collection.poster_path;
 this.popularity = jsonMovieObj.popularity;
 this.released_on = jsonMovieObj.release_date;
}

//==yelp constructor=====

function Yelp(jsonYelpObj){
  //console.log(jsonYelpObj);
  this.name = jsonYelpObj;
  this.image_url = jsonYelpObj;
  this.price = jsonYelpObj;
  this.rating = jsonYelpObj;
  this.url = jsonYelpObj;
}

//==========Listen======
client.connect()
.then(() => {
app.listen(PORT, () => console.log(`running on PORT : ${PORT}`));

});