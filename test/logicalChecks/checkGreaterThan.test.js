/* eslint-disable no-undef */
const checkGreaterThan = require('../../src/helpers/query/src/logicalChecks/checkGreaterThan');

describe('Testing greater than', () => {
  it('Testing greater than (number)', () => {
    const result = checkGreaterThan(2, 1, '>');
    expect(result).toStrictEqual({ result: true, stop: true });
  });
  it('Testing greater than (letter)', () => {
    const result = checkGreaterThan('b', 'a', '>');
    expect(result).toStrictEqual({ result: true, stop: true });
  });
  it('Testing not greater than', () => {
    const result = checkGreaterThan(1, 1, '>');
    expect(result).toStrictEqual({ result: false, stop: true });
  });
  it('Testing not greater or equal to', () => {
    const result = checkGreaterThan(0, 1, '>=');
    expect(result).toStrictEqual({ result: false, stop: true });
  });
  it('Testing greater or equal to', () => {
    const result = checkGreaterThan(1, 1, '>=');
    expect(result).toStrictEqual({ result: true, stop: true });
  });
  it('Testing invalid operator', () => {
    const result = checkGreaterThan(1, 1, 'x');
    expect(result).toStrictEqual({ stop: false });
  });
});
