import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, ViewPropTypes, WebView } from 'react-native';
import { html, signaturePad, application } from './src';

export default class SignaturePad extends PureComponent {
  webViewRef = React.createRef();

  // We don't use WebView's injectedJavaScript because on Android, the WebView re-injects the JavaScript upon every url change.
  // Given that we use url changes to communicate signature changes to the React Native app, the JS is re-injected every time a stroke is drawn.
  source = {
    html: html(
      `"use strict";`
      + signaturePad
      + application(this.props)
    ) 
  }

  _onNavigationChange = args => this._parseMessageFromWebViewNavigationChange(unescape(args.url));

  _parseMessageFromWebViewNavigationChange = newUrl => {
    //Example input:
    //applewebdata://4985ECDA-4C2B-4E37-87ED-0070D14EB985#executeFunction=jsError&arguments=%7B%22message%22:%22ReferenceError:%20Can't%20find%20variable:%20WHADDUP%22,%22url%22:%22applewebdata://4985ECDA-4C2B-4E37-87ED-0070D14EB985%22,%22line%22:340,%22column%22:10%7D"
    //All parameters to the native world are passed via a hash url where every parameter is passed as &[ParameterName]<-[Content]&
    const hashUrlIndex = newUrl.lastIndexOf('#');
    if (hashUrlIndex === -1) return;

    let hashUrl = newUrl.substring(hashUrlIndex);
    hashUrl = decodeURIComponent(hashUrl);
    const regexFindAllSubmittedParameters = /&(.*?)&/g;

    const parameters = {};
    let parameterMatch = regexFindAllSubmittedParameters.exec(hashUrl);
    if (!parameterMatch) return;

    while(parameterMatch) {
      const parameterPair = parameterMatch[1]; //For example executeFunction=jsError or arguments=...
      const parameterPairSplit = parameterPair.split('<-');
      if(parameterPairSplit.length === 2) {
        parameters[parameterPairSplit[0]] = parameterPairSplit[1];
      }

      parameterMatch = regexFindAllSubmittedParameters.exec(hashUrl);
    }

    if(!this._attemptToExecuteNativeFunctionFromWebViewMessage(parameters)) {
      logger.warn({ parameters, hashUrl }, 'Received an unknown set of parameters from WebView');
    }
  };

  _attemptToExecuteNativeFunctionFromWebViewMessage = ({ executeFunction, arguments: args }) => {
    if (!executeFunction || !args) return false;
  
    const referencedFunction = this[executeFunction];
    if (typeof referencedFunction === 'function') {
      referencedFunction.apply(this, [JSON.parse(args)]);
      return true;
    }
  };

  _renderError = args => this.props.onError({ details: args });

  _onError = args => this.props.onError({ details: args} );

  _onSubmit = ({ dataUrl }) => this.props.onSubmit(dataUrl);

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
      renderError={ this._renderError }
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