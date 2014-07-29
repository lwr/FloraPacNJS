/**
 *
 * ---------- usage -------------------------------------------------
 *
 *      var FindProxyForURL = require("./test/pacTest")("flora.pac");
 *
 *      FindProxyForURL(null, "twitter.com");
 *
 *      FindProxyForURL(null, "twitter.com", function (proxy) {
 *          console.log(proxy);
 *      });
 *
 */


var dns = require('dns');
var fs = require('fs');
var vm = require('vm');
var Fiber = require('fibers');
var Future = require('fibers/future');

module.exports = pacTester;

function pacTester(pacFile) {

    var pacData = fs.readFileSync(pacFile).toString();

    // noinspection JSUnusedGlobalSymbols
    var context = {
        isPlainHostName : function (host) {
            return (host.indexOf('.') == -1)
        },
        dnsResolve      : function (host) {
            adapterFn.dnsResolveResult = Future.wrap(dns.lookup)(host, null).wait();
            return adapterFn.dnsResolveResult;
        },
        console         : console
    };

    var FindProxyForURL = vm.runInNewContext(pacData + "; FindProxyForURL", context, pacFile);

    if (typeof FindProxyForURL == "function") {
        var adapterFn = function (url, host, callback) {
            new Fiber(function () {
                adapterFn.dnsResolveResult = null;
                var proxy = FindProxyForURL(url, host);
                (callback || console.info)(proxy);
            }).run();
        };
        return adapterFn;
    }

    console.error("Invalid pac file:", pacFile);
    return function () {};
}


// command line mode
if (process.mainModule === module) {

    var argv = require('optimist').argv;
    var filename = argv._[0];
    var host = argv._[1];

    if (filename && host) {
        var adapterFn = pacTester(filename);
        adapterFn(null, host, function (proxy) {
            if (adapterFn.dnsResolveResult) {
                console.info("Host '%s' resolved to: %s", host, adapterFn.dnsResolveResult);
            }
            console.info(proxy);
        });
    } else {
        console.info(""
                + "Usage: pacTest [PAC_FILE] [HOSTNAME]\n"
                + "\n"
                + "Examples:\n"
                + "  pacTest flora.pac twitter.com\n"
                + "");
    }
}
