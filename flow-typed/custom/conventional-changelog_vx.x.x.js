// flow-typed signature: f12453082e3c54c7f65de49112b71a65
// flow-typed version: <<STUB>>/conventional-changelog_v^1.1.6/flow_v0.58.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'conventional-changelog'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

 import typeof Stream from 'stream';

 type Commit = {
   header: string,
   hash: string,
   version?: string
 };

declare module 'conventional-changelog' {
  declare module.exports: (
    config?: {
      preset?: string,
      pkg: {
        path: string,
      },
      releaseCount?: number,
      transform?: (
        commit: Commit,
        cb: (err: ?Error, commit: ?Commit) => void
      ) => void,
    },
    options?: {
      repoUrl?: string,
    },
  ) => {
    pipe: (stream: any) => {
      on: (evt: string, Function) => void
    }
  }
}