'use strict';

const newrelic = require('newrelic');
const express = require('express');
const moment = require('moment-timezone');
const fetch = require('node-fetch');

const app = express();

function setTime(date) {
  var rome = moment.tz(date, "DD/MM/YYYY hh:mm", "Europe/Rome");
  var utc = rome.clone().tz("Europe/London");
  return utc.format();
};

app.get('/', (req, res) => {
  fetch('https://www.raiplayradio.it/programmi/gr1/?json')
    .then(body => body.json())
    .then(json => {
      return fetch(`https://www.raiplayradio.it${json.pathFirstItem}`)
    })
    .then(body => body.json())
    .then(json => {
      res.json({
        uid: json.ID,
        updateDate: setTime(`${json.datePublished} ${json.timePublished}`),
        titleText: json.name,
        mainText: "",
        streamUrl: json.audio.contentUrl.replace('http://', 'https://'),
        redirectionUrl: "https://grr.rai.it",
      })
    })
    .catch(err => {
      console.log(err);
    });
});

app.listen(process.env.PORT || 8080, () => console.log(
  `Your app is listening on port ${process.env.PORT || 8080}`));
