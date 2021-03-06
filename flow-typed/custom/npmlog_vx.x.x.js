// @flow
// flow-typed signature: c564dfdfbc43208bd2d07975c7143c1b
// flow-typed version: <<STUB>>/npmlog_v^4.1.2/flow_v0.58.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'npmlog'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module 'npmlog' {
  declare module.exports: {
    level: string,
    log: (level: string, prefix: string, message: string, ...rest: Array<any>) => void,
    silly: (prefix: string, message: string, ...rest: Array<any>) => void,
    verbose: (prefix: string, message: string, ...rest: Array<any>) => void,
    info: (prefix: string, message: string, ...rest: Array<any>) => void,
    http: (prefix: string, message: string, ...rest: Array<any>) => void,
    warn: (prefix: string, message: string, ...rest: Array<any>) => void,
    error: (prefix: string, message: string, ...rest: Array<any>) => void,
  };
}
