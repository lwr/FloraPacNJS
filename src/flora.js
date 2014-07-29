var path = require('path');
var fs = require('fs');

var pacTemplate = fs.readFileSync(path.dirname(module.filename) + "/" +
        "flora.pac.template.js", {encoding : "utf8"});

// jshint -W103:false
var baseConfig = require("./pac-config");

if (process.mainModule === module) {
    floraPac();
}

module.exports = floraPac;

function floraPac(userConfig) {
    // do a copy
    var config = JSON.parse(JSON.stringify(baseConfig));

    if (userConfig == null) {
        userConfig = JSON.parse(fs.readFileSync("pac-config.json") || "{}");
    }

    for (var key in userConfig) {
        if (userConfig.hasOwnProperty(key)) {
            if (Array.isArray(config[key])) {
                Array.prototype.push.apply(config[key], userConfig[key]);
            } else {
                config[key] = userConfig[key];
            }
        }
    }

    var cnIpList = [];
    fetchChnIpList(function (startIpInt, endIpInt, date) {
        cnIpList.push([startIpInt, endIpInt]);
        if (config.debug) {
            console.log("Found chn ip: %s - %s at %s", intToIPv4(startIpInt), intToIPv4(endIpInt), date);
        }
    }, function (ok) {
        if (ok) {
            var pacData = generatePac(config, cnIpList);
            fs.writeFileSync(config.file, pacData, {encoding : 'utf8'});
            console.log("File generated:", config.file);
            if (config.callback) {
                config.callback();
            }
        }
    });
}


function generatePac(config, cnIpList) {
    var result = pacTemplate;
    config["domains"] = config["domains"] || {};
    for (var key in config) {
        var domainValue = null;
        var ipList, i;
        if (!config.hasOwnProperty(key)) {
            // noinspection UnnecessaryContinueJS
            continue;

        } else if (["normalIps", "localIps"].indexOf(key) != -1) {
            ipList = (key == "normalIps") ? cnIpList : [];
            for (i in config[key]) {
                if (config[key].hasOwnProperty(i)) {
                    var ipRange = config[key][i];
                    var start = ip4ToInt(ipRange[0]);
                    var end = ip4ToInt(ipRange[1]);
                    if ((ipRange.length == 2) && (start != null) && (start <= end)) {
                        ipList.push([start, end]);
                    } else {
                        console.log("Found invalid ip range of '" + key + "':", ipRange);
                    }
                }
            }
            ipList.sort(function (r1, r2) {return r1[0] - r2[0]});
            config[key] = ipList;

        } else if (["fakeIps"].indexOf(key) != -1) {
            ipList = [];
            for (i in config[key]) {
                if (config[key].hasOwnProperty(i)) {
                    var value = ip4ToInt(config[key][i]);
                    if (value != null) {
                        ipList.push(value);
                    } else {
                        console.log("Found invalid ip of '" + key + "':", config[key][i]);
                    }
                }
            }
            ipList.sort();
            config[key] = ipList;

        } else if (key == "localDomains") {
            domainValue = 1;
        } else if (key == "normalDomains") {
            domainValue = 2;
        } else if (key == "walledDomains") {
            domainValue = 3;
        }

        if (domainValue) {
            for (i in config[key]) {
                if (config[key].hasOwnProperty(i)) {
                    config["domains"][config[key][i]] = domainValue;
                }
            }
        }
    }

    for (key in config) {
        if (config.hasOwnProperty(key)) {
            if ((config[key] != null) && (typeof config[key] == "object")) {
                result = result.replace("\"{{" + key + "}}\"", JSON.stringify(config[key]));
            } else {
                result = result.replace("{{" + key + "}}", config[key] || "");
            }
        }
    }
    return result;
}


function ip4ToInt(ipv4) {
    var b = ipv4.split('.', 4);
    return (b.length == 4)
            && (b[0] >= 0 && b[0] <= 255)
            && (b[1] >= 0 && b[1] <= 255)
            && (b[2] >= 0 && b[2] <= 255)
            && (b[3] >= 0 && b[3] <= 255)
            ? ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0 : null;
}

function intToIPv4(i) {
    return (i >> 24 & 0xff) + "." + (i >> 16 & 0xff) + "." + (i >> 8 & 0xff) + "." + (i & 0xff);
}

function fetchChnIpList(callback, end) {
    var url = 'http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest';
    var file = 'delegated-apnic-latest';

    if (fs.existsSync(file)) {
        fs.readFile(file, {encoding : 'utf8'}, function (err, data) {
            if (err) {
                console.info("Read File " + file + " failed:", err);
            } else {
                getChunk(data);
                getChunk('\n');
                end(true);
            }
        });
    } else {
        // fetch data from apnic
        console.info("Fetching data from apnic.net, it might take a few minutes, please wait...");
        var http = require('http');
        http.get(url, function (res) {
            if (res.statusCode == 200) {
                res.setEncoding('utf8');
                res.on('data', getChunk);
                res.on('end', function () {
                    getChunk('\n');
                    end(true);
                });
                res.on('error', function (e) {
                    console.info("Fetching data from apnic.net failed:", e);
                    end(false);
                });
            } else {
                console.info("Fetching data from apnic.net failed:", res.statusCode);
                end(false);
            }
        });
    }

    // apnic|CN|ipv4|111.119.64.0|16384|20090703|allocated
    var pattern = /^apnic\|cn\|ipv4\|([0-9\.]+)\|([0-9]+)\|([0-9]+)\|a.*$/gmi;

    var lastChunk = "";

    function getChunk(chunk) {
        chunk = (lastChunk + chunk);
        var lastLF = chunk.lastIndexOf('\n');
        if (lastLF == -1) {
            lastChunk = chunk;
        } else {
            lastChunk = chunk.substring(lastLF + 1);
            chunk = chunk.substring(0, lastLF);
            for (var arr; (arr = pattern.exec(chunk)) !== null;) {
                var startIp = ip4ToInt(arr[1]);
                var endIp = startIp + parseInt(arr[2]);
                callback(startIp, endIp, arr[3]);
            }
        }
    }
}

