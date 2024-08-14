import { FilterInRange } from './product.interface';

export function transformFilter(value: string): FilterInRange | undefined {
  if (!value) return undefined;
  const filterArray: string[] = value.trim().split(',');
  const filterObject: Partial<FilterInRange> = {};
  filterArray.forEach((filter: string) => {
    const [key, val] = filter.split(':');
    filterObject[key] = parseFloat(val);
  });
  return filterObject as FilterInRange;
}
