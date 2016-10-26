/* ====================================================================================
 * ..######..########.########...######.##......##.##....##.##.......########.######...
 * .##....##....##....##....##.##.......##....##...##....##.##.......##....##.##...##..
 * .##..........##....##....##.##.......##..##.....##....##.##.......##....##.##...##..
 * ..######.....##....########.##.......####.......##....##.##.......########.######...
 * .......##....##....##....##.##.......##..##.....##....##.##.......##....##.##...##..
 * .##....##....##....##....##.##.......##....##...##....##.##.......##....##.##....##.
 * ..######.....##....##....##...######.##......##.########.########.##....##.##....##.
 * ====================================================================================
 *  @author: [jiminikiz] |
 *  @version: 4.1.0
 *  @date: 2016-10-25
 * ====================================================================================
 */

////////////////////////////////
'use strict'; require('colors');
////////////////////////////////

var express = require('express');

module.exports = ( options ) => {
    var port = options.port||process.env.PORT||8888;

    switch ( process.env.NODE_ENV ) {
        case 'production':
            console.info('$[info]'.cyan,'ENV :: Production'.bold.red);
            console.info = () => {};
            port = 0; // do not change this to 80, see below
        break;
        case 'staging':
            console.info('$[info]'.cyan,'ENV :: Staging'.bold.yellow);
            port = 0; // do not change this to 80, see below
        break;
        case 'development':
            console.info('$[info]'.cyan,'ENV :: Development'.bold.green);
        break;
        default:
            console.error('You need to specify the environment.');
            console.error('export NODE_ENV=[development|staging|production]');
            return process.exit(1);
    }

    var app = express();

    app.set('upsince', Date.now());
    app.disable('x-powered-by');

    app.middleware = {
        secured: ( req, res, next ) => {
            if( req.protocol === 'http' || !req.headers['x-forwarded-proto'] ) {
                res.set('X-Forwarded-Proto','https');
                res.redirect(`https://${req.headers.host}/${req.url}`);
            } else {
                next();
            }
        },
        noFavicon: ( req, res, next ) => {
            if ( req.url !== '/favicon.ico') {
                next();
            } else {
                res.status( 204 ).set('Content-Type','image/x-icon').end();
            }
        },
        bodyParser: ( req, res, next ) => {
            // defined below
            new BodyBuilder(req,res,next);
        },
        cookies: ( req, res, next ) => {
            if( req.headers.cookie !== undefined ) {
                var cookies = req.headers.cookie.split(';'),
                    jar = {}, c = cookies.length, cookie, crumbs;

                while( c-- ) {
                    cookie = cookies[c];
                    crumbs = cookie.split('=');

                    jar[ crumbs.shift().trim() ] = decodeURI( crumbs.join('=') );
                }
                req.cookies = jar;
            }
            next();
        },
        logger: ( req, res, next ) => {
            console.log(`[${Date.now()}] ${req.method.toString().cyan} :: ${req.ip} - ${req.url}`);
            next();
        }
    };

    if( options.middleware && options.middleware.length ) {
        options.middleware.map((ware) => {
            if( app.middleware[ware] ) {
                app.use(app.middleware[ware]);
                console.info('$[info]'.cyan, '(middleware loaded)'.green, ware);
            } else {
                console.warn('$[warn]'.yellow, '(middleware unknown)'.red, ware);
            }
        });
    }

    // load this before routes so that we have access to [req.render]
    if( options.views ) {
        if( options.views.path ) {
            app.set('views', options.views.path);
        }
        if( options.views.engine ) {
            app.set('view engine', options.views.engine);
        }
    } else {
        app.disable('views');
    }

    // load routes
    if( options.routes && options.routes.path ) {
        require(options.routes.path)( app );
    }
    // expose the public folder by default
    // @note: it is recommended that this is loaded after routes,
    // so that global middleware can be applied to assets
    if( options.fileServer && options.fileServer.path ) {
        app.use(express.static(options.fileServer.path));
    }

    // start the server with an HTTP protocol
    app.listen( port || 80, started );

    if( options.https ) {
        // start the server with HTTPS as well if certs are supplied
        require('https')
            .createServer(options.https, app )
            .listen( port + 443, started );
    }

    return app;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

function BodyBuilder( req, res, next ) {
    this.body = '';
    this.req  = req;
    this.res  = res;
    this.next = next;

    req.on('data', ( chunk ) => {
        this.body += chunk;
    }).once('end', ()=> {
        this.req.body = require('querystring').parse( this.body );
        this.next();
    });
}

function started() {
    console.info(`${"$[info]".cyan} Server started on port:`, this.address().port.toString().bold.yellow);
}
