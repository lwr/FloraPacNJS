/**
 * This test case should run after the pac script
 */


module.exports = testCases;

function testCases(FindProxyForURL, proxy) {

    var direct = 'DIRECT';

    var totalCount = 0;
    var successCount = 0;
    var failCount = 0;

    function assertProxy(expect, host) {
        ++totalCount;
        FindProxyForURL(null, host, function (actual) {
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
        });
    }

    var x = setInterval(function () {
        if (successCount + failCount == totalCount) {
            clearInterval(x);
            if (failCount) {
                console.assert(false,
                        "Test result: total=%d, success=%d, failed=%d", totalCount, successCount, failCount);
            } else {
                console.info("Test passed: total=%d", totalCount);
            }
        }
    }, 100);


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
}

