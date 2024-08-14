import { getKeyFromUrl } from './get-key-from-url';

describe('getKeyFromUrl', () => {
  it('should return the last part of the URL', () => {
    const url = 'http://example.com/path/to/file';
    const key = getKeyFromUrl(url);
    expect(key).toBe('file');
  });

  it('should return an empty string if the URL ends with a slash', () => {
    const url = 'http://example.com/path/to/file/';
    const key = getKeyFromUrl(url);
    expect(key).toBe('');
  });

  it('should return the whole URL if there are no slashes', () => {
    const url = 'file';
    const key = getKeyFromUrl(url);
    expect(key).toBe('file');
  });
});
