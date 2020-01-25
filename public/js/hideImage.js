'use strict'

const hideImage = imageId => {
  const image = document.getElementById(imageId);
  image.style['opacity'] = '0';
  setTimeout(() => (image.style['opacity'] = '1'), 1000);
};