/**
 * This test case should run after the pac script.
 *
 * @type {exports} a wrapped fiber function wait to run test cases
 */


module.exports = testCases;


function testCases() {
    return require('./Fiber').applyWith(runTestCases, null, arguments);
}


function runTestCases(name, FindProxyForURL, proxy, internalProxy) {

    var direct = 'DIRECT';

    var totalCount = 0;
    var successCount = 0;
    var failCount = 0;

    internalProxy = internalProxy || direct;

    function assertProxy(expect, host) {
        ++totalCount;
        FindProxyForURL.dnsResolveResult = null;
        var actual = FindProxyForURL(host, host);
        if ((expect == actual)
                || (expect == proxy && actual == proxy + "; DIRECT")
                || (expect == internalProxy && actual == internalProxy + "; DIRECT")) {
            ++successCount;
            return;
        }

        ++failCount;
        var ip = FindProxyForURL.dnsResolveResult;
        if (ip) {
            console.error("Test failed: host=%s(%s), expect=%s, actual=%s", host, ip, expect, actual);
        } else {
            console.error("Test failed: host=%s, expect=%s, actual=%s", host, expect, actual);
        }
    }


    var time = process.hrtime();

    function endTest() {
        var diff = process.hrtime(time);
        var seconds = (diff[0] * 1e3 + diff[1] * 1e-6);
        if (failCount) {
            console.info("%s end in %d ms, average in %d ms", name, seconds, seconds / (successCount + failCount));
            console.assert(false,
                    "%s result: total=%d, success=%d, failed=%d", name, totalCount, successCount, failCount);
        } else {
            console.info("%s passed in %d ms, average in %d ms, total=%d",
                    name, seconds, seconds / totalCount, totalCount);
        }
    }


    assertProxy(proxy, 'www.google.com');
    // noinspection SpellCheckingInspection
    assertProxy(proxy, 'smtp.google.com');
    assertProxy(proxy, 'a.google.com');
    assertProxy(proxy, 'a.b.google.com');
    assertProxy(proxy, 'a.b.c.google.com');
    assertProxy(proxy, 'www.twitter.com');
    assertProxy(proxy, 'www.facebook.com');
    assertProxy(proxy, 'www.google.co.jp');
    assertProxy(proxy, 'www.facebook.com');
    assertProxy(proxy, 'www.youtube.com');
    // noinspection SpellCheckingInspection
    assertProxy(proxy, 's.ytimg.com');
    // noinspection SpellCheckingInspection
    assertProxy(proxy, 'r1---sn-a5m7zu7l.googlevideo.com');
    // noinspection SpellCheckingInspection
    assertProxy(proxy, 'appspot.com');
    // noinspection SpellCheckingInspection
    assertProxy(proxy, 'my.appspot.com');
    // noinspection SpellCheckingInspection
    assertProxy(proxy, 'www.userdefined.com');

    assertProxy(internalProxy, 'www.baidu.com');
    // noinspection SpellCheckingInspection
    assertProxy(internalProxy, 'www.youku.com');
    // noinspection SpellCheckingInspection
    assertProxy(internalProxy, 'www.taobao.com');
    assertProxy(internalProxy, 'www.iCoremail.net');

    assertProxy(direct, 'simpleName');
    assertProxy(direct, '127.0.0.1');
    assertProxy(direct, '127.0.0.255');
    assertProxy(direct, '192.168.255.255');
    assertProxy(proxy, '192.169.0.0');

    endTest();
}

