export const handleNativeFunction = `
  window.document.addEventListener(
    'message',
    function(event) {
      const data = JSON.parse(event.data);
      const method = data.method;
      const args = data.args;
      if (typeof signaturePad[method] !== 'function') return;
      signaturePad[method].apply(signaturePad, args);
    }
  );
`;
