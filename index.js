import React, { PureComponent } from 'react';
import { StyleSheet, View, ViewPropTypes, WebView } from 'react-native';
import PropTypes from 'prop-types';
import { html, signaturePad, application } from './src';

const styles = StyleSheet.create({
  webView: {
    // This transparent background color fix layout bug on Android 5.1 and 9
    // Bug: on fist render WebView render on full screen, and on first touch it collapsed to expected size,
    // it's hide other components on screen
    backgroundColor: 'transparent'
  }
});

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
      style={ [this.props.style, styles.webView] }
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