# mono-semantic
Semantic Release for individual packages of a monorepo.

- Pulls package versions from __npm__ meaning you can leave your packages at `0.0.0`
- Resolves inter-dependent packages linked via `link:../linked-package`
- Uses the angular commit style to assign commits to packages
- Manage package versions independently
- Create git tags
- Generate individual changelogs for each package

## Installation
```
npm install -g mono-semantic
```

## Usage
```bash
# Do your normal CI stuff
yarn install
yarn lerna bootstrap
yarn lerna run test
# Publish your mono-repo
npm mono-semantic pre
npm mono-semantic publish
npm mono-semantic post
# Update git
git commit -a -m "Update changelogs"
git push --tags && git push
```

## PRE
1. updates each package with the currently-released version
2. resolves any inter-dependent packages i.e. `{ "package2": "link:../package2" }` is resolved to `{ "package2": "^1.0.1" }`
3. finds all commits that mention the current package (i.e. `fix(package2): foo`) and updates the major/minor/patch version

## PUBLISH
1.

## POST
make sure that all git tags have been fetched in order to generate an accurate change log

## Configuration
### CLI Flags

### Environment Variables

### package.json
