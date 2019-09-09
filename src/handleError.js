export const handleError = `
  window.onerror = function(message, url, line, column, error) {
    executeNativeFunction('onError', { message: message, url: url, line: line, column: column });
  };
`;