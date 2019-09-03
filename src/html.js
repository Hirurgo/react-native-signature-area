export const html = script =>`
  <html>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1">
    <style>
      * {
        margin: 0;
        padding: 0;
      }

      html, body {
        width: 100%;
        height: 100%;
      }

      canvas {
        position: absolute;
        transform: translateZ(0);
      }
    </style>
    <body>
      <canvas/>
      <script>${script}</script>
    </body>
  </html>
`;