/**
 * generate test pac file and run all test cases
 */


var floraPac = require("../src/flora");
var testCases = require('./testCases');

floraPac({
    file     : "./flora-test.pac",
    proxy    : "PROXY",
    callback : function () {
        // generate the pac adaptor function from pac file
        var FindProxyForURL = require("./pacTest")(this.file);

        // remove temp pac file
        require('fs').unlinkSync(this.file);
        console.info("File dropped:", this.file);

        // run test cases once
        testCases("Test1", FindProxyForURL, this.proxy).run();

        // run test cases twice
        testCases("Test2", FindProxyForURL, this.proxy).run();
    }
});

