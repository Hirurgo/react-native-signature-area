import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, ViewPropTypes, WebView } from 'react-native';
import { html, signaturePad, application } from './src';

export default class SignaturePad extends PureComponent {
  webViewRef = React.createRef();

  // We don't use WebView's injectedJavaScript because on Android, the WebView re-injects the JavaScript upon every url change.
  source = {
    html: html(
      `"use strict";`
      + signaturePad
      + application(this.props)
    ) 
  }

  onMessage = event => {
    const { func, args } = JSON.parse(event.nativeEvent.data);
    this.props[func](args);
  }

  submit = (width, height) => {
    width = typeof width === 'number' ? width : undefined;
    height = typeof height === 'number' ? height : undefined;
    this.webViewRef.current.postMessage(JSON.stringify({ method: 'submit', args: [ width, height ] }));
  }

  clear = () => this.webViewRef.current.postMessage(JSON.stringify({ method: 'clear' }));

  render = () => (
    <WebView
      ref={ this.webViewRef }
      onNavigationStateChange={ this._onNavigationChange }
      onMessage={ this.onMessage }
      renderError={ this.props.onError }
      source={ this.source }
      scrollEnabled={ false }
      bounces={ false }
      useWebKit={ true }
      javaScriptEnabled={ true }
      style={ this.props.style }
    />
  )
}

SignaturePad.propTypes = {
  dataUrl: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  outputWidth: PropTypes.number,
  outputHeight: PropTypes.number,
  minDotWidth: PropTypes.number,
  maxDotWidth: PropTypes.number,
  velocityFilterWeight: PropTypes.number,
  dotSize: PropTypes.number,
  padding: PropTypes.number,
  backgroundColor: PropTypes.string,
  penColor: PropTypes.string,
  pointWasOutOfCanvas: PropTypes.bool,
  style: ViewPropTypes.style,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
};

SignaturePad.defaultProps = {
  onSubmit: () => {},
  onError: () => {}
};