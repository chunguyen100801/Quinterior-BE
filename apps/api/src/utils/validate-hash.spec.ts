import * as bcrypt from 'bcryptjs';
import { validateHash } from './validate-hash.util';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('validateHash function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return false if password or hash is not provided', async () => {
    const result1 = await validateHash(undefined, 'hash');
    const result2 = await validateHash('password', undefined);
    const result3 = await validateHash(undefined, undefined);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return true if password and hash match', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await validateHash('password', 'hash');

    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hash');
    expect(result).toBe(true);
  });

  it('should return false if password and hash do not match', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await validateHash('password', 'hash');

    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hash');
    expect(result).toBe(false);
  });
});
