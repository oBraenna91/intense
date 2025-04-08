module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.ignoreWarnings = [
          { 
            module: /node_modules\/react-circular-input/,
            message: /Failed to parse source map/
          },
          { 
            module: /node_modules\/react-swipeable-button/,
            message: /Failed to parse source map/
          }
        ];
        
        return webpackConfig;
      }
    }
  };