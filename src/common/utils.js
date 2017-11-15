// @flow
import * as r from 'ramda';
import type { Package } from '../annotations';

// eslint-disable-next-line max-len
export const whileNil = (...conditions: Array<(arg: any) => any>) => (arg: any): any => r.reduce(
  (v, c) => r.ifElse(
    r.isNil,
    () => c(arg),
    r.identity,
  )(v),
  null, conditions);

export function promisify <A>(f: (...args: Array<any>) => void) {
  return (...args: Array<any>): Promise<A> => {
    return new Promise((resolve, reject) => {
      const cb = (err: Error, result: A) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      };
      const argsWithCb = args.concat(cb);
      f.apply(null, argsWithCb);
    });
  };
}

export const stringify = (
  obj: Object
) => JSON.stringify(obj, null, 2);

export const parse = (
  str: string
): any => JSON.parse(str);

export const findPackage = (
  allPackages: Array<Package>
) => (
  name: string
): ?Package => r.find(r.propEq('name', name), allPackages);

export const charAt = r.curry((i: number, str: string) => str.charAt(i));

export const buildScriptCmd = (
  pkg: Package
) => (
  scripts: Array<string>
) => r.pipe(
  r.map((script) => `yarn lerna --scope=${pkg.name} run ${script}`),
  r.join(' && '),
)(scripts);
