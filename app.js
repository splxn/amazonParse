"use strict";
const fs = require('fs');
const http = require('http');
const _ = require('lodash');

const regPrice = /<span id="priceblock_dealprice" class="a-size-medium a-color-price">\$\d+\.\d{2}<\/span>/g;
const regTitle = /<span id="productTitle" class="a-size-large">.+<\/span>/g;
const regDesc = /<span class="a-list-item">[^<|\n]+<\/span>/g;
const regImages = /http:\/\/ecx\.images-amazon\.com\/images\/I\/[a-z|0-9]{11}\._[a-z|0-9]{6}_\.jpg/gi;

var arrItems = []

function processHTML(file) {

  function readHTML() {
    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf8', (err, body) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(body);
      });
    });
  }

  function createItemsObjects(body) {
    let objItem = {};

    let price = body.match(regPrice);
    price.forEach((item,  index) => {
      price[index] = item.slice(68,-7);
    });

    var title = body.match(regTitle);
    title.forEach((item,  index) => {
      title[index] = item.slice(45,-7);
    });

    var description = body.match(regDesc);
    description.forEach((item,  index) => {
      description[index] = item.slice(27,-7);
    });

    var sortedImages = _.sortedUniq(body.match(regImages));

    objItem.title = title;
    objItem.price = price;
    objItem.description = description;
    objItem.images = sortedImages;

    return objItem;
  }

  function writeToJSON(objItem) {
    arrItems.push(objItem);
    console.log(arrItems);

    fs.writeFile('items.json', JSON.stringify(arrItems, null, 2), 'utf-8');
  }

  readHTML()
    .then(createItemsObjects)
    .then(writeToJSON)
    .catch(function(err) {
      throw new Error('Cannot read file');
    });
}

for (let i = 1; i <= 10; i++) {
  processHTML('item' + i + '.html');
}