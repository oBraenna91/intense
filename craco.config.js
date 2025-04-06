// craco.config.js
module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        // Add ignoreWarnings configuration
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