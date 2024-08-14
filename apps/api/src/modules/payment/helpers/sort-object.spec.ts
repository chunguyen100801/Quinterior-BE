import { sortObject } from './sort-object.helper';

describe('sortObject', () => {
  it('should sort the object keys in ascending order', () => {
    const obj = {
      zebra: 'z',
      apple: 'a',
      monkey: 'm',
    };

    const sortedObj = sortObject(obj);

    expect(Object.keys(sortedObj)).toEqual(['apple', 'monkey', 'zebra']);
    expect(sortedObj).toEqual({
      apple: 'a',
      monkey: 'm',
      zebra: 'z',
    });
  });

  it('should return an empty object when given an empty object', () => {
    const obj = {};

    const sortedObj = sortObject(obj);

    expect(sortedObj).toEqual({});
  });

  it('should return the same object when given an object with a single key-value pair', () => {
    const obj = {
      apple: 'a',
    };

    const sortedObj = sortObject(obj);

    expect(sortedObj).toEqual({
      apple: 'a',
    });
  });

  it('should correctly sort keys with special characters', () => {
    const obj = {
      'zebra!': 'z',
      'apple#': 'a',
      monkey$: 'm',
    };

    const sortedObj = sortObject(obj);

    expect(Object.keys(sortedObj)).toEqual(['apple%23', 'monkey%24', 'zebra!']);
    expect(sortedObj).toEqual({
      'apple%23': 'undefined',
      'monkey%24': 'undefined',
      'zebra!': 'z',
    });
  });
});
