import { executeNativeFunction } from './executeNativeFunction';
import { handleNativeFunction } from './handleNativeFunction';
import { handleResize } from './handleResize';
import { handleError } from './handleError';

export const application = (options) => `
  const signaturePad = new SignaturePad(
    window.document.querySelector('canvas'),
    {
      dataUrl: '${options.dataUrl}',
      width: ${options.width},
      height: ${options.height},
      outputWidth: ${options.outputWidth},
      outputHeight: ${options.outputHeight},
      minDotWidth: ${options.minDotWidth},
      maxDotWidth: ${options.maxDotWidth},
      velocityFilterWeight: ${options.velocityFilterWeight},
      dotSize: ${options.dotSize},
      padding: ${options.padding},
      backgroundColor: '${options.backgroundColor || ''}',
      penColor: '${options.penColor || ''}',
      pointWasOutOfCanvas: ${options.pointWasOutOfCanvas},
      onSubmit: function(dataUrl) {
        executeNativeFunction('_onSubmit', { dataUrl });
      }
    }
  );

  ${executeNativeFunction}
  ${handleNativeFunction}
  ${handleResize}
  ${handleError}
`;
