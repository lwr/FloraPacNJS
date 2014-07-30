/**
 * This test case should run after the pac script.
 *
 * @type {exports} a wrapped fiber function wait to run test cases
 */


module.exports = testCases;


function testCases() {
    return require('./Fiber').applyWith(runTestCases, null, arguments);
}


function runTestCases(name, FindProxyForURL, proxy) {

    var direct = 'DIRECT';

    var totalCount = 0;
    var successCount = 0;
    var failCount = 0;

    function assertProxy(expect, host) {
        ++totalCount;
        FindProxyForURL.dnsResolveResult = null;
        var actual = FindProxyForURL(null, host);
        if ((expect == actual) || (expect == proxy && actual == proxy + "; DIRECT")) {
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

    assertProxy(direct, 'www.baidu.com');
    // noinspection SpellCheckingInspection
    assertProxy(direct, 'www.youku.com');
    // noinspection SpellCheckingInspection
    assertProxy(direct, 'www.taobao.com');
    assertProxy(direct, 'www.iCoremail.net');

    endTest();
}

