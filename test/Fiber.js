/**
 *
 * @type {exports} an improved Fiber implementations with args supports
 */

var Fiber = require('fibers');
var exports = module.exports = FiberWithArgs;

exports.applyWith = applyWith;


function FiberWithArgs(fn, args) {
    if (arguments.length == 0) {
        // TypeError: Fiber expects 1 argument
        return Fiber();
    }

    if (arguments.length == 1) {
        return Fiber(fn);
    }

    return applyWith(fn, null, Array.prototype.slice.call(arguments, 1));
}


function applyWith(fn, thisArg, args) {
    if (typeof fn == "function") {
        return Fiber(function () {fn.apply(thisArg, args)});
    }
    throw new TypeError("Fiber expects a function");
}



