export const executeNativeFunction = `
  function executeNativeFunction(func, args) {
    window.location.hash = '&executeFunction<-' + func
     + '&'
     + '&arguments<-' + JSON.stringify(args)
     + '&'
     + (window.ReactNativeWebView ? window.ReactNativeWebView.postMessage(JSON.stringify(args)) : '')
     + '&';
  };
`;
