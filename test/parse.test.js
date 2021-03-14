/* eslint-disable no-undef */
const { parse } = require('../index');

describe('Make an array', () => {
  it('Input object stays an object', () => {
    const result = parse({ test: true });
    expect(result).toStrictEqual({ test: true });
  });
  it('Input array stays an array', () => {
    const result = parse([true, true]);
    expect(result).toStrictEqual([true, true]);
  });
  it('Stringified object returns parsed object 1', () => {
    const result = parse(JSON.stringify({ test: true }), true);
    expect(result).toStrictEqual({ test: true });
  });
  it('Stringified object returns parsed object 2', () => {
    const result = parse(JSON.stringify({ test: true }), false);
    expect(result).toStrictEqual({ test: true });
  });
  it('Safe parse returns string for non-parsable string input', () => {
    const result = parse('test', true);
    expect(result).toStrictEqual('test');
  });
  it('Non-safe parse returns error for non-parsable string input', () => {
    try {
      parse('test', false);
    } catch (e) {
      expect(e.message).toBe('Unexpected token e in JSON at position 1');
    }
  });
});
