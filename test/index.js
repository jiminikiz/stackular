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
