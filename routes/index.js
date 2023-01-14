var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var fetch = require('node-fetch');

let rank;
let money;
let mileage;
let power;
let descriptionList;
let registration;
let totalAdd;
let adds = [];

function getFormulaOneDrivers() {

  return fetch('https://proxy.scrapeops.io/v1/?api_key=b8625ca1-faf5-4841-99c3-db8224b1e995&url=https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz',
    {
      headers:
        {"User-Agent": 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',}
    })
    .then((response) => {
      return response?.text();
    })
    .then(res => {

      const $ = cheerio.load(res, null, false);
      totalAdd = $('.ooa-1000v3p');
      totalAdd = totalAdd[0]?.children[2]?.children[0]?.data?.split(" ")[1].replace(/[{()}]/g, '');

      return $('article').map((i, el) => {

        rank = $(el).find('a');
        money = $(el).find('.e1b25f6f11');
        descriptionList = $(el).find('ul');
        registration = descriptionList[0]?.children[1]?.children[0]?.data;
        mileage = descriptionList[0]?.children[2]?.children[0]?.data;
        power = descriptionList[0]?.children[3]?.children[0]?.data;

        adds.push({
          totalAdd: totalAdd,
          title:rank[0]?.children[0]?.data,
          price: money[0]?.children[0]?.data,
          registrationYear:registration,
          mileage:mileage,
          power: power,
        });
      });
    })
    .then(() => console.log(adds[0]))
}

router.get('/', function (req, res, next) {
  getFormulaOneDrivers()
    .then(() => {
      res.send(adds);
    });
});

module.exports = router;
