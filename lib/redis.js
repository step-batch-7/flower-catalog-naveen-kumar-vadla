'use strict';

const redis = require('redis');

const { COMMENTS_PATH } = require('../config');

const client = redis.createClient(
  process.env.REDIS_URL || 'redis://localhost:6379'
);

client.on('error', err => {
  console.log('Error ' + err);
});

let comments = [];
client.get(COMMENTS_PATH, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  if (data) {
    comments = JSON.parse(data);
  }
});

const loadComments = () => comments;

const saveComments = comments => {
  client.set(COMMENTS_PATH, JSON.stringify(comments));
};

module.exports = { loadComments, saveComments };
