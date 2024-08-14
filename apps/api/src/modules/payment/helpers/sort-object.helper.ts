import { SortedObject } from '../payment.interface';

export function sortObject(
  obj: SortedObject<string | number>,
): SortedObject<string | number> {
  const sorted: SortedObject<string | number> = {};
  const str: string[] = [];
  let key: keyof typeof obj;

  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }

  str.sort();

  for (key of str) {
    sorted[key] = encodeURIComponent(obj[key as keyof typeof obj]).replace(
      /%20/g,
      '+',
    );
  }

  return sorted;
}
