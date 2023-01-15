var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var fetch = require('node-fetch');

let title;
let money;
let mileage;
let power;
let descriptionList;
let registration;
let totalAdd;
let totalPage = 15;
const initialUrl = "https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz";
let pageQueryParams = [];
let id;
let url;
const promises = [];


function getTotalAddCount($)
{
  totalAdd = $('.ooa-1000v3p');
  totalAdd = totalAdd[0]?.children[2]?.children[0]?.data?.split(" ")[1].replace(/[{()}]/g, '');
}

function addItems(element,title)
{
  id=element?.attribs?.id;
  url=title[1]?.attribs?.href;
}

function getNextPageUrl() {
  for (let i = 1; i <= totalPage; i++) {
    pageQueryParams.push("?page=" + i)
  }
}

function scrapeTruckItem(j) {

  return fetch('https://proxy.scrapeops.io/v1/?api_key=b8625ca1-faf5-4841-99c3-db8224b1e995&url='+initialUrl + pageQueryParams[j],
    {
      headers:
        {"User-Agent": 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',}
    })

    .then((response) => {
      return response?.text();
    })

    .then(res => {
      const $ = cheerio.load(res, null, false);

      getTotalAddCount($)

      return $('article').map((i, element) =>
      {
        title = $(element).find('a');
        money = $(element).find('.e1b25f6f11');
        descriptionList = $(element).find('ul');
        registration = descriptionList[0]?.children[1]?.children[0]?.data;
        mileage = descriptionList[0]?.children[2]?.children[0]?.data;
        power = descriptionList[0]?.children[3]?.children[0]?.data;

        addItems(element,title);

        return {
          pageNumber: j,
          totalAdd: totalAdd,
          id:id,
          url:url,
          title: title[0]?.children[0]?.data,
          price: money[0]?.children[0]?.data,
          registrationYear: registration,
          mileage: mileage,
          power: power,
        };
      });
    })

    .catch((error) => {
      console.log("========================");
      console.log("Error Fetching Page ", j);
      console.log(error);
      console.log("========================");
    });
}

router.get('/', function (req, res, next) {
  getNextPageUrl();
  for ( let i = 1; i <= totalPage; i++)
  {
    promises.push(scrapeTruckItem(i));
  }
  Promise.all(promises)
    .then((adds) => {
      const responses = [];
      adds.map(adds => responses.push(...adds))
      res.send(responses);
    })
});

module.exports = router;
