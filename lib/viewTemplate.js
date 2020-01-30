'use strict';

const fs = require('fs');
const TEMPLATES_FOLDER = `${__dirname}/../templates`;
const loadTemplate = (fileName, propertyBag) => {
  const content = fs.readFileSync(`${TEMPLATES_FOLDER}/${fileName}`, 'utf8');
  const replaceKeyWithValue = (content, key) => {
    const pattern = new RegExp(`__${key}__`, 'g');
    return content.replace(pattern, propertyBag[key]);
  };
  const keys = Object.keys(propertyBag);
  const html = keys.reduce(replaceKeyWithValue, content);
  return html;
};

module.exports = { loadTemplate };
