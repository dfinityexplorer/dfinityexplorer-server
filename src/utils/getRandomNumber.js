/**
 * @file getRandomNumber
 * @copyright Copyright (c) 2018 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

 /**
 * Return a random number between start and end.
 * @param {Number} start The starting number.
 * @param {Number} end The ending number.
 * @return {Number} The random number.
 * @private
 */
module.exports = function getRandomNumber(start, end) {
  return Math.random() * (end - start) + start;
}
