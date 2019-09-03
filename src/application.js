export const application = (dataURL = '') => `
  const signaturePad = new SignaturePad(
    window.document.querySelector('canvas'),
    {
      width: window.document.body.clientWidth || window.innerWidth,
      height: window.document.body.clientHeight || window.innerHeight,
      backgroundColor: "white",
      minDotWidth: 1,
      maxDotWidth: 4,
      onSubmit: function(dataUrl) {
        executeNativeFunction('_onSubmit', { dataUrl });
      }
    }
  );

  ${!!dataURL} && signaturePad.fromDataURL(${dataURL});
`;
