import * as bcrypt from 'bcryptjs';
import { generateHash } from './generate-hash.util';

// Mock bcrypt.hashSync() method
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(),
}));

describe('generateHash function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a hash from a password', () => {
    const password = 'mypassword';
    const expectedHash = 'hashedpassword';

    (bcrypt.hashSync as jest.Mock).mockReturnValue(expectedHash);

    const result = generateHash(password);

    expect(bcrypt.hashSync).toHaveBeenCalledWith(password, 10);
    expect(result).toBe(expectedHash);
  });
});
