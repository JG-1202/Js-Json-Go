const JG = require('../../../index.js');

const pathTransformer = require('../../helpers/pathTransformer');
const stringify = require('../basic/stringify');
const getMultiplePathElements = require('../../helpers/pathElements/getMultiple');
const doesPathIndicateComplexity = require('./src/doesPathIndicateComplexity');
const simpleGet = require('./src/simpleGet');
const validateOutput = require('./src/validateOutput');
const getAllKeysFromObject = require('../../helpers/pathElements/getKeys/getAllKeysFromObject');
const getAllKeysFromArray = require('../../helpers/pathElements/getKeys/getAllKeysFromArray');

const getCache = {};

const getPathElements = (element, obj, tempObject, getType, priorPath) => {
  if (element.wildcard) {
    if (getType === 'number') {
      return getAllKeysFromArray(tempObject);
    }
    return getAllKeysFromObject(tempObject);
  }
  return getMultiplePathElements(element, obj, tempObject, getType, priorPath);
};

/**
 * If there is only one result, update tempObject
 */
const setTempObjectNewIteration = (elementValues, tempObject, getType) => {
  if (elementValues.length === 1) {
    const toReturn = tempObject[elementValues[0][getType]];
    return toReturn;
  }
  return undefined;
};

/**
 * If there is a remaining tempObject, add it to results.
 */
const addFinalTempToResults = (results, tempObject) => {
  if (tempObject !== undefined) {
    results.push(tempObject);
  }
  return results;
};

/**
 * Get all results that need to be retreived with getAll
 */
const addMultipleResults = (arrayPath, index, elementValues, remainingPath, obj, results) => {
  let newResults = results;
  const previousPath = arrayPath.slice(0, index);
  elementValues.forEach((elementValue) => {
    const checkPath = [
      ...previousPath, elementValue, ...remainingPath,
    ];
    const r = new JG.Json(obj).getAll(checkPath);
    newResults = [...newResults, ...r];
  });
  return newResults;
};

/**
 * Get all results that can be retreived with get function
 */
const addSingleResults = (elementValues, tempObject, remainingPath, newResults) => {
  elementValues.forEach((elementValue) => {
    const singleResult = simpleGet(tempObject, [elementValue, ...remainingPath]);
    if (singleResult !== undefined) {
      newResults.push(singleResult);
    }
  });
};

/**
 * When multiple elementValues are found, attempt to get them all and store in results
 */
const addToResults = (results, elementValues, index, obj, arrayPath, tempObject) => {
  let newResults = results;
  if (elementValues.length > 1) {
    const remainingPath = arrayPath.slice(index + 1);
    if (doesPathIndicateComplexity(remainingPath)) {
      newResults = addMultipleResults(
        arrayPath, index, elementValues, remainingPath, obj, newResults,
      );
    } else {
      addSingleResults(elementValues, tempObject, remainingPath, newResults);
    }
  }
  return newResults;
};

/**
 * Update arrayPath with resolved element
 */
const setArrayPathIndex = (elementValues, currentPath) => {
  if (elementValues.length === 1 && typeof elementValues[0] === 'object') {
    return elementValues[0];
  }
  return currentPath;
};

/**
 * Returns an array with element, or empty array if element is undefined
 */
const returnArray = (element) => {
  if (element !== undefined) {
    return [element];
  }
  return [];
};

/**
 * Store result into cache so that it can be reused
 */
const setCache = (stringifiedPath, obj, tempObject) => {
  getCache[stringifiedPath] = { object: obj, result: tempObject };
};

/**
 * Validate if cache is for the right object
 */
const validateCache = (cache, obj) => cache && cache.object === obj;

/**
 * Retreives all values from objects specified path
 * @param {Object} obj - object/array from which value should be retreived.
 * @param {any} path - string or array representation of path to set.
 * @returns {Array} returns array of values that match the specified path with logical checks
 */
const getAll = (obj, path) => {
  const stringifiedPath = stringify(path);
  if (validateCache(getCache[stringifiedPath], obj)) {
    return getCache[stringifiedPath].result;
  }
  const arrayPath = pathTransformer(path);
  if (!doesPathIndicateComplexity(arrayPath)) {
    return returnArray(simpleGet(obj, arrayPath));
  }
  const priorPath = [];
  let results = [];
  let tempObject = obj;
  arrayPath.every((singleElement, index) => {
    const element = (singleElement);
    if (Array.isArray(tempObject)) {
      const elementValues = getPathElements(element, obj, tempObject, 'number', priorPath);
      results = addToResults(results, elementValues, index, obj, arrayPath, tempObject);
      tempObject = setTempObjectNewIteration(elementValues, tempObject, 'number');
      arrayPath[index] = setArrayPathIndex(elementValues, arrayPath[index]);
    } else {
      const elementValues = getPathElements(element, obj, tempObject, 'string', priorPath);
      results = addToResults(results, elementValues, index, obj, arrayPath, tempObject);
      tempObject = setTempObjectNewIteration(elementValues, tempObject, 'string');
      arrayPath[index] = setArrayPathIndex(elementValues, arrayPath[index]);
    }
    priorPath.push(arrayPath[index]);
    const {
      shouldItContinue, newTempObject,
    } = validateOutput(tempObject, arrayPath.length - 1 === index);
    tempObject = newTempObject;
    return shouldItContinue;
  });
  results = addFinalTempToResults(results, tempObject);
  setCache(stringifiedPath, obj, results);
  return results;
};

module.exports = getAll;
