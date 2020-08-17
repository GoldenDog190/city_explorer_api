//==========Packages===============
const express = require('express');
require('dotenv').config();
const cors = require('cors');

//=========Global Variables=======
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

//==========Routes================

//==location==
app.get('/location', (request, response) =>{
  const jsonObj = require('./data/location.json');
  const constructedLocation = new Location(jsonObj);

  response.send(constructedLocation);
});

//==weather==


//==error==

//=======Constructor and 0ther Functions========

//==location constructor==
function Location(jsonObj){
  console.log(jsonObj);

  this.latitude = jsonObj;
  this.longitude = jsonObj;
}

//==weather constructor==

//==========Start the server======

app.listen(PORT, () => console.log(`running on PORT : ${PORT}`));