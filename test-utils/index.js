import sinon from 'sinon';

// creates a stub that always returns the nth argument
export const rebound = (n = 0) => sinon.stub().callsFake(function(...args) {
  return args[n];
});

// creates a stub that always returns a promise resolved with the nth argument
export const reboundp = (n = 0) => sinon.stub().callsFake(function(...args) {
  return Promise.resolve(args[n]);
});
