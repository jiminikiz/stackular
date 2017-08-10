# Stackular
> A config driven express initializer

Initialize express in one line with the most common boiler plate options already enabled.

## Installation

```bash

npm install --save jiminikiz/stackular

```

## Usage
> Initializing is pretty simple:


```javascript

require('stackular')() // initializing with default options

```

### Options
> The object below shows all of the possible options of the configuration object:

```javascript

// Options are not required; you can initialize the module simply with: require('stackular')();
require('stackular')({
  port: 8888,     // Number, default is 8888
  middleware: [   // Array, default is undefined
    'secured',    // > redirects all traffic to HTTPS
    'noFavicon',  // > skips requests for `/favicon.ico`
    'bodyParser', // > parses **form-url-encoded** strings
    'cookies',    // > a simple cookie-parser
    'logger'      // > a very simple request logger
  ],
  views: {                       // Object, default is undefined
    path: `${__dirname}/views`,  // String, default is `${__dirname}/views`
    engine: `ejs` || `pug`,      // String, default is undefined
  },
  routes: {
    path: `${__dirname}/routes`, // String, default is undefined
  },
  fileServer: {
    path: `${__dirname}/public`  // String, default is undefined
  },
  https: { // Object, same object used with the native node `https` module,
    // > i.e. https.createServer(options);
    key:  fs.readFileSync('/path/to/key'),
    cert: fs.readFileSync('/path/to/cert')
  }                   
});

```
