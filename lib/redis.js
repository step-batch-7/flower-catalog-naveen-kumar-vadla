'use strict';

const redis = require('redis');

const client = redis.createClient(
  process.env.REDIS_URL || 'redis://localhost:6379'
);

client.on('error', err => {
  console.log('Error ' + err);
});

let comments = [];
client.get('flower-catalog-comments', (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  comments = JSON.parse(data);
});

const loadComments = () => comments;

const saveComments = comments => {
  client.set('flower-catalog-comments', JSON.stringify(comments));
};

module.exports = { loadComments, saveComments };
