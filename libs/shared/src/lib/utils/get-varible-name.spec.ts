import { getVariableName } from './get-varible-name';

enum RoleTest {
  Admin = 'Admin',
  Manager = 'Manager',
}

describe('getVariableName', () => {
  describe('getVariableName', () => {
    // Existing test case
    it('should return the variable name', () => {
      const testVar = () => RoleTest;
      const result = getVariableName(testVar);
      expect(result).toBe('RoleTest');
    });

    it('should return the property name when the variable is a property of an object', () => {
      const testObj = { prop: RoleTest.Admin };
      const result = getVariableName(() => testObj.prop);
      expect(result).toBe('prop');
    });

    it('should return the last property name when the variable is a property of a nested object', () => {
      const testObj = { prop: { nestedProp: RoleTest.Admin } };
      const result = getVariableName(() => testObj.prop.nestedProp);
      expect(result).toBe('nestedProp');
    });
  });
});
