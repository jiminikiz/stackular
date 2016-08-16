/* ================================================
 * ..######..########.########...######.##......##.
 * .##....##....##....##....##.##.......##....##...
 * .##..........##....##....##.##.......##..##.....
 * ..######.....##....########.##.......####.......
 * .......##....##....##....##.##.......##..##.....
 * .##....##....##....##....##.##.......##....##...
 * ..######.....##....##....##...######.##......##.
 * ================================================
 *  @author: [jiminikiz] | [augur.io]
 *  @version: 4.0.0
 *  @date: 2016-08-16
 * =================================================
 */

////////////////////////////////
'use strict'; require('colors');
////////////////////////////////

var Express = require('express');

module.exports = function ( options ) {
    console.log('\n==========================+'.cyan,'STACK','+=============================\n'.cyan);
    if( !options.root ) {
        console.error('You need to pass in the __dirname variable as [root] within options:', options);
        return process.exit(1);
    }

    var port = options.port||process.env.PORT||13370;

    switch ( process.env.NODE_ENV ) {
        case 'production':
            console.log('# Production #'.bold.red);
            console.info = function () {};
            port = 0; // do not change this to 80, see below
        break;
        case 'staging':
            console.log('# Staging #'.bold.yellow);
            port = 0; // do not change this to 80, see below
        break;
        case 'development':
            console.log('# Development #'.bold.green);
        break;
        default:
            console.error('You need to specify the environment.');
            console.error('export NODE_ENV=[development|staging|production]');
            return process.exit(1);
    }

    var app = Express(), Readfile = require('fs').readFileSync;

    app.set('upsince', Date.now());

    app.middlewares = {
        secured: ( req, res, next ) => {
            if( req.protocol === 'http' || !req.headers['x-forwarded-proto'] ) {
                res.set('X-Forwarded-Proto','https');
                res.redirect('https://'+ req.headers.host + req.url);
            } else {
                next();
            }
        },
        nofavicon: ( req, res, next ) => {
            if ( req.url !== '/favicon.ico') {
                next();
            } else {
                res.status( 204 ).set('Content-Type','image/x-icon').end();
            }
        },
        bodyparser: ( req, res, next ) => {
            // defined below
            new BodyBuilder(req,res,next);
        },
        healthcheck: ( req ) => {
            req.res.end();
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
        env: ( req, res, next ) => {
            res.locals.env = res.app.locals.settings.env;
            next();
        },
        logRequests: ( req, res, next ) => {
            console.log(
                Date.now() +':'+ new Date().toISOString(),
                req.ip,
                req.method,
                req.url
            );
            next();
        }
    };

    // default options
    app.disable('x-powered-by').enable('trust proxy');

    if ( options.logRequests === true ) {
        app.use( app.middlewares.logRequests );
    }

    // prevent express from auto requesting the (route|asset): "/favicon.ico"
    if ( options.favicon !== true ) {
        app.use( app.middlewares.nofavicon );
    }

    // load this before routes so that we have access to [req.render]
    if( options.views ) {
        // the following will allow you to require html files directly in node
        // (mostly used for server-side template parsing via AJAX)
        require.extensions['.html'] = function (module, filename) { module.exports = Readfile(filename, 'utf8'); };
        app.set('views', (options.root + (options.views.path||'/views')));
        app.engine('ejs',  require('ejs').renderFile);
        app.engine('htm',  require('ejs').renderFile);
        app.engine('html', require('ejs').renderFile);
    } else {
        app.disable('views');
    }

    // load routes
    if( options.routes ) {
        require(options.root +'/routes')( app );
    }

    // expose the public folder by default
    // @note: it is recommender that this is loaded after routes,
    // so that global middlewares can be applied to assets
    if( options.private !== true ) {
        app.use(Express.static('public', {
            setHeaders: (res, path, fileprops) => {
                // debugery
                // console.log({
                //     path: path,
                //     fileprops: fileprops
                // });

                // Express should be doing this by default,
                // but for some reason we have seen this not to be the case...
                res.set('Last-Modified', fileprops.mtime);
            }
        }));
    }

    // start the server with an HTTP protocol
    require('http').createServer( app ).listen( port || 80, started );

    if( options.ssl ) {
        // start the server with HTTPS as well if certs are supplied
        require('https').createServer({
            ca: '',//Readfile( options.ssl.ca ),
            cert: '',//Readfile( options.ssl.cert ),
            key:  ''//Readfile( options.ssl.key )
        }, app ).listen( port + 443, started);
    }

    return app;
};

module.exports.Express = Express;

///////////////////////////////////////////////////////////////////////////////////////////////////////

function BodyBuilder( req, res, next ) {
    this.body = '';
    this.req = req;
    this.res = res;
    this.next = next;

    req.on('data', ( chunk ) => {
        this.body += chunk;
    }).once('end', ()=> {
        this.req.body = require('querystring').parse( this.body );
        this.next();
    });
}

function started() {
    console.log('# Server started on port:'.cyan, this.address().port );
}
