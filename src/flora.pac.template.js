// noinspection JSUnusedGlobalSymbols, JSUnusedLocalSymbols
/**
 * @return {string}
 */
function FindProxyForURL(url, host) {

    var list = "{{normalIps}}";
    var localIps = "{{localIps}}";
    var fakeIps = "{{fakeIps}}";
    var domains = "{{domains}}"; // 1 : local, 2 - safe, 3, danger

    var safeProxy = '{{internalProxy}}';
    var proxy = '{{proxy}}';
    var direct = 'DIRECT;';


    function ip4ToInt(ipv4) {
        var b = ipv4.split('.', 4);
        return (b.length == 4)
                && (b[0] >= 0 && b[0] <= 255)
                && (b[1] >= 0 && b[1] <= 255)
                && (b[2] >= 0 && b[2] <= 255)
                && (b[3] >= 0 && b[3] <= 255)
                ? ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0 : null;
    }


    function findDomain(domain) {
        for (; ;) {
            var i = domains[domain];
            if (i) {
                return i;
            }
            var dot = domain.indexOf('.');
            if (dot < 0) {
                return;
            }
            domain = domain.substr(dot + 1);
        }
    }


    function matchIp(ip, list) {
        if (list.length == 0)
            return false;
        var left = 0, right = list.length;
        do {
            var mid = Math.floor((left + right) / 2);
            var ip_f = (ip & list[mid][1]) >>> 0;
            var m = (list[mid][0] & list[mid][1]) >>> 0;
            if (ip_f == m) {
                return true;
            } else if (ip_f > m) {
                left = mid + 1;
            } else {
                right = mid;
            }
        } while (left + 1 <= right);
        return false;
    }

    var proxies = [
        null,                                               //
        direct,                                             // 1 - LOCAL
        (safeProxy ? (safeProxy + ';' + direct) : direct),  // 2 - SAFE
        (proxy + ';' + direct)                              // 3 - GFW blocks
    ];

    // noinspection JSUnresolvedFunction
    if (isPlainHostName(host)) {
        return direct;
    }

    var intIp = ip4ToInt(host);
    if (intIp == null) {
        var p = proxies[findDomain(host)];
        if (p) {
            return p;
        }

        // noinspection JSUnresolvedFunction
        intIp = ip4ToInt(dnsResolve(host) || "");
        if (intIp == null) {
            return proxy;
        }
    }

    if (matchIp(intIp, localIps)) {
        return direct;
    }

    if (fakeIps.indexOf(intIp) != -1) {
        return proxy; // do not fallback to DIRECT for fake ip
    }

    if (matchIp(intIp, list)) {
        return proxies[2];
    }

    return proxies[3];
}
