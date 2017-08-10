process.env.NODE_ENV = 'development';

require('../index')({
  port: 1337,
  middleware: [   // Array, default is null
    `secured`,
    `noFavicon`,
    `bodyParser`,
    `cookies`,
    `logger`,
  ]
});
