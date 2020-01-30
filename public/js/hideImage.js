'use strict';

const hideImage = () => {
  const seconds = 1000;
  const image = document.getElementById('watering-flowers');
  image.style['visibility'] = 'hidden';
  setTimeout(() => {
    image.style['visibility'] = 'visible';
  }, seconds);
};

module.exports = { hideImage };
