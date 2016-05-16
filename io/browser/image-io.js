// Image loading/saving for browser
/* global document, HTMLCanvasElement, Image */
/* eslint-disable guard-for-in, complexity, no-try-catch */
import assert from 'assert';
import through from 'through';

/*
 * Returns data bytes representing a compressed image in PNG or JPG format,
 * This data can be saved using file system (f) methods or
 * used in a request.
 * @param {Image}  image - Image or Canvas
 * @param {String} opt.type='png' - png, jpg or image/png, image/jpg are valid
 * @param {String} opt.dataURI= - Whether to include a data URI header
 */
function compressImage(image, type) {
  if (image instanceof HTMLCanvasElement) {
    const canvas = image;
    return canvas.toDataURL(type);
  }

  assert(image instanceof Image, 'getImageData accepts image or canvas');
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext('2d').drawImage(image, 0, 0);

  // Get raw image data
  const data =
    canvas.toDataURL(type || 'png')
      .replace(/^data:image\/(png|jpg);base64,/, '');

  // Dump data into stream and return
  const result = through();
  process.nextTick(() => result.end(new Buffer(data, 'base64')));
  return result;
}

/*
 * Loads images asynchronously
 * returns a promise tracking the load
 */
function loadImage(url) {
  return new Promise(function(resolve, reject) {
    try {
      const image = new Image();
      image.onload = function() {
        resolve(image);
      };
      image.onerror = function() {
        reject(new Error(`Could not load image ${url}.`));
      };
      image.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

export default {
  compressImage,
  loadImage
};
