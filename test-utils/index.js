import sinon from 'sinon';

export const rebound = (n = 0) => sinon.stub().callsFake(function(...args) {
  return args[n];
});

export const reboundp = (n = 0) => sinon.stub().callsFake(function(...args) {
  return Promise.resolve(args[n]);
});
