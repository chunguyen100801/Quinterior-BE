import { validateConfig } from './validate-config.util';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

jest.mock('class-transformer', () => ({
  plainToClass: jest.fn(),
}));

jest.mock('class-validator', () => ({
  validateSync: jest.fn(),
}));

class TestClass {
  testProp: string;
}

describe('validateConfig function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate config successfully', () => {
    const config = { testProp: 'testValue' };
    const envVariablesClass = TestClass;

    (plainToClass as jest.Mock).mockReturnValue(config);
    (validateSync as jest.Mock).mockReturnValue([]);

    const result = validateConfig(config, envVariablesClass);

    expect(plainToClass).toHaveBeenCalledWith(envVariablesClass, config, {
      enableImplicitConversion: true,
    });
    expect(validateSync).toHaveBeenCalledWith(config, {
      skipMissingProperties: false,
    });
    expect(result).toEqual(config);
  });

  it('should throw an error if validation fails', () => {
    const config = { testProp: 'testValue' };
    const envVariablesClass = TestClass;
    const errors = ['Error'];

    (plainToClass as jest.Mock).mockReturnValue(config);
    (validateSync as jest.Mock).mockReturnValue(errors);

    expect(() => validateConfig(config, envVariablesClass)).toThrowError(
      new Error(errors.toString()),
    );
  });
});
