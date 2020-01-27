'use strict';

const hideImage = () => {
  const image = document.getElementById('watering-flowers');
  image.style['visibility'] = 'hidden';
  setTimeout(() => (image.style['visibility'] = 'visible'), 1000);
};
