export const handleResize = `
  window.onresize = function(event) {
    signaturePad.resizeCanvas(
      window.document.body.clientWidth || window.innerWidth,
      window.document.body.clientHeight || window.innerHeight
    );
  };
`;
