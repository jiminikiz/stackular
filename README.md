# Stackular
> A config driven express initializer

This module is create for configuring multiple different servers that have only slightly different configurations.

## Installation

1. Add the following to your `package.json`:
    ```javascript
    "dependencies": {
        "stackular": "ssh+git@github.com:jiminikiz/stackular.git"
    }
    ```

2. Install via NPM
    ```bash
    npm Install
    ```

## Usage
> Initializing is pretty simple, it only accepts a configuration object as an argument.

### Options
> The object below shows all of the possible options of the configuration object:

```javascript

// Options are not required; you can initialize the module simply with: require('stackular')();
require('stackular')({
    port: 8888,     // Number, default is 8888
    middleware: [   // Array, default is null
        `secured`
        `noFavicon`
        `bodyParser`
        `cookies`
        `logger`
    ],
    views: {        // Object, default is null
        path: ''    // String, default is null; Recommended: `${__dirname}/views`
        engine: ''  // String, default is null; Recommended: `ejs` || `pug`
    },
    routes: {
        path: '',   // String, default is null; Recommended: `${__dirname}/routes`
    },
    fileServer: {
        path: ''    // String, no default; Recommended: `${__dirname}/public`
    },
    https: {        // Object, same object used with the native node `https` module,
                    // i.e. https.createServer(options);
        key:  fs.readFileSync('/path/to/key'),
        cert: fs.readFileSync('/path/to/cert')
    }                   
});
```

### Built-in Middleware
> Each built-in middleware was created as a simple function. This keeps the code base for `stackular` very lightweight reduces dependencies on other third-party modules.

- `secured`     :: redirects all traffic to HTTPS
- `noFavicon`   :: skips requests for `/favicon.ico`
- `bodyParser`  :: parses **form-url-encoded** strings
- `cookies`     :: a simple cookie-parser
- `logger`      :: a very simple request logger
