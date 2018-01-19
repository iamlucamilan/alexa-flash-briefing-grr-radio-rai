'use strict';

const newrelic = require('newrelic');
const express = require('express');
const moment = require('moment-timezone');
const fetch = require('node-fetch');

const app = express();

function setTime(time) {
  var date = time.split('del')[1].trim();
  var rome = moment.tz(date,"DD/MM/YYYY hh:mm", "Europe/Rome");
  var utc = rome.clone().tz("Europe/London");
  return utc.format();
};

app.get('/', (req, res) => {
  fetch(
    'http://www.rai.it/dl/grr/archivio/ContentSet-65267d10-8c80-495a-b9b9-f2bd91d81bb4.json'
  )
  .then(body => body.json())
  .then( json => {
    const relevant = json.items[0];
    const uriFetches = fetch(relevant['mediauri']);

    return Promise.resolve(uriFetches).then(value => {
      const url = value['url'];
      res.json({
          uid: relevant['uniquename'],
          updateDate: setTime(relevant['title']),
          titleText: relevant['title'],
          "mainText": "",
          streamUrl: url.replace('http://', 'https://'),
          redirectionUrl: "https://grr.rai.it",
      });
    })
  })
  .catch(err => {
    console.log(err);
  });
});

app.listen(process.env.PORT || 8080, () => console.log(
  `Your app is listening on port ${process.env.PORT || 8080}`));
