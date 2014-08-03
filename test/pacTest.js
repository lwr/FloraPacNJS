/**
 *
 * ---------- usage -------------------------------------------------

 var FindProxyForURL = require("./test/pacTest")("flora.pac");
 require('fibers')(function() {
     console.log(FindProxyForURL(null, "twitter.com"));
 }).run();

 */


var dns = require('dns');
var fs = require('fs');
var vm = require('vm');
var Fiber = require('fibers');
var Future = require('fibers/future');

module.exports = pacTester;

function pacTester(pacFile, context_) {

    var pacData = fs.readFileSync(pacFile).toString();

    // noinspection JSUnusedGlobalSymbols
    var context = {
        isPlainHostName : function (host) {
            return (host.indexOf('.') == -1)
        },
        dnsResolve      : function (host) {
            FindProxyForURL.dnsResolveResult = Future.wrap(dns.lookup)(host, null).wait();
            return FindProxyForURL.dnsResolveResult;
        },
        console         : console
    };

    for (var i in context_) {
        if (context_.hasOwnProperty(i)) {
            context[i] = context_[i];
        }
    }

    var FindProxyForURL = vm.runInNewContext(pacData + "; FindProxyForURL", context, pacFile);
    if (typeof FindProxyForURL == "function") {
        return FindProxyForURL;
    } else {
        console.error("Invalid pac file:", pacFile);
        return function () {};
    }
}


// command line mode
if (process.mainModule === module) {

    var argv = require('optimist').argv;
    var filename = argv._[0];
    var host = argv._[1];

    if (filename && host) {
        var FindProxyForURL = pacTester(filename);
        Fiber(function () {
            var proxy = FindProxyForURL(null, host);
            var ip = FindProxyForURL.dnsResolveResult;
            if (ip) {
                console.info("Host '%s' was resolved to: %s (%s)", host, ip, require("../src/ip2int")(ip));
            }
            console.info(proxy);
        }).run();
    } else {
        console.info(""
                + "Usage: pacTest [PAC_FILE] [HOSTNAME]\n"
                + "\n"
                + "Examples:\n"
                + "  pacTest flora.pac twitter.com\n"
                + "");
    }
}
