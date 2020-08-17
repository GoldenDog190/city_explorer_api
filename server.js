//==========Packages===============
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { json } = require('express');

//=========Global Variables=======
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

//==========Routes================

//==location==
app.get('/location', (request, response) =>{
  const jsonObj = require('./data/location.json');
   console.log(jsonObj);

  const city = request.query.city;

  const constructedLocation = new Location(jsonObj,city);
   console.log(constructedLocation);

  response.send(constructedLocation);
});

//==weather==


//==error==

//=======Constructor and 0ther Functions========

//==location constructor==
function Location(jsonObj, city){
  console.log(jsonObj);

  this.latitude = jsonObj[0].lat;
  this.longitude = jsonObj[0].lon;
  this.formatted_query = jsonObj[0].display_name;
  this.search_query = city;
}

//==weather constructor==

//==========Start the server======

app.listen(PORT, () => console.log(`running on PORT : ${PORT}`));