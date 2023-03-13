window.require = require;
Object.defineProperty(window, "require", {
  writable: true,
  value: jest.fn().mockImplementation(require),
});
