/**
 * generate test pac file and run all test cases
 */


require("../src/flora")({
    file     : "./flora-test.pac",
    proxy    : "PROXY",
    callback : function () {
        // generate the pac adaptor function from pac file
        var FindProxyForURL = require("./pacTest")(this.file);

        // remove temp pac file
        require('fs').unlinkSync(this.file);
        console.info("File dropped:", this.file);

        // run test cases
        require('fibers')(
                require('./testCases').bind(null, FindProxyForURL, this.proxy)
        ).run();
    }
});

