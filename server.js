'use strict';

const newrelic = require('newrelic');
const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.get('/', (req, res) => {
  fetch('https://www.raiplayradio.it/radio1/?json')
    .then(body => body.json())
    .then(
      json =>
        json.blocchi
          .find((blocco) => blocco.name == "Ultimi GR").lanci
          .find((lancio) => lancio.name == "Ultimo GR1").pathID
    )
    .then(pathID => fetch(`https://www.raiplayradio.it${pathID}`))
    .then(body => body.json())
    .then(json => {
      const now = new Date().getTime();
      const topOfHour = new Date(now - (now % (60 * 60 * 1000)));
      res.json({
        uid: json.ID,
        // `updateDate` is a required response object attribute, but the feed
        // object doesn't contain any time data, so let's just use top of the
        // hour as an arbitrary time
        updateDate: topOfHour.toISOString(),
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
