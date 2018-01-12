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


// `res.json` converts JavaScript objects to JSON and
// appropriately sets the Content-Type header to
// application/json; charset=utf-8 . By default,
// we'll get a 200 HTTP status code.
app.get('/', (req, res) => {
  fetch(
    'http://www.rai.it/dl/grr/archivio/ContentSet-d6361ec2-3bf9-4f19-9026-5a496a5da118.json'
  )
  .then(body => body.json())
  .then( json => {
   //console.log(json);
    const relevant = json.items.slice(json.items.length - 1);

    console.log(relevant);

    const uriFetches = relevant
    .map(r => r.mediauri)
    .map(mediauri => fetch(mediauri));

    return Promise.all(uriFetches).then(values => {
      const urls = values.map(v => v.url);
      console.log(urls);

      res.json(
        relevant.map((r, idx) => ({
          uid: r.uniquename,
          updateDate: setTime(r.title),
          titleText: r.title,
          "mainText": "",
          streamUrl: urls[idx].replace('http://', 'https://'),
          redirectionUrl: "https://grr.rai.it",

        }))
      );
    })
  })
  .catch(err => {
    console.log(err);
  });
});

app.listen(process.env.PORT || 8080, () => console.log(
  `Your app is listening on port ${process.env.PORT || 8080}`));
