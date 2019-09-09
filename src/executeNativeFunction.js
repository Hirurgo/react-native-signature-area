export const executeNativeFunction = `
  function executeNativeFunction(func, args) {
    window.postMessage(JSON.stringify({ func, args }));
  };
`;
