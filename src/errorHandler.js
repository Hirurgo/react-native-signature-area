export const errorHandler = `
  window.onerror = function(message, url, line, column, error) {
    executeNativeFunction('_onError', { message: message, url: url, line: line, column: column });
  };
`;