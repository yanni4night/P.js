/**
 * Copyright (C) 2014 yanni4night.com
 * p.js
 *
 * changelog
 * 2014-11-30[16:05:07]:revised
 * 2014-12-01[10:57:13]:better invoke
 *
 * @author yanni4night@gmail.com
 * @version 0.1.1
 * @since 0.1.0
 */

(function(global, factory) {
    "use strict";
    if ('undefined' !== typeof define && define.amd) {
        define(factory);
    } else if ('undefined' !== typeof module && module.exports) {
        module.exports = factory();
    } else {
        global.P = factory();
    }
})(this, function() {
    "use strict";
    var noop = function(args) {
        return args;
    }
    var UNDEF = undefined;
    var STRUNDEF = typeof undef;
    var STRFUNC = typeof noop;
    var STATE_PENDING = 'pending';
    var STATE_FULFILLED = 'fulfilled';
    var STATE_REJECTED = 'rejected';

    var P = function(func) {
        this.state = STATE_PENDING;
        var fns = [];
        var value = UNDEF;
        /**
         * Trigger events
         * @since 0.1.0
         */
        var trigger = function() {
            var ret, fn;

            while (fn = fns.shift()) {
                if (STATE_FULFILLED === this.state) {
                    ret = (fn.onFulfilled) ? fn.onFulfilled.call(null, value) : UNDEF;
                    if (fn.resolve) {
                        fn.resolve(ret);
                    }
                } else if (STATE_REJECTED === this.state) {
                    ret = fn.onRejected ? fn.onRejected.call(null, value) : UNDEF;
                    if (fn.reject) {
                        fn.reject(ret);
                    }
                }
            }

        }.bind(this);

        /**
         * Change state to fulfilled.
         *
         * @param  {Mixin} data
         * @since 0.1.0
         */
        var resolve = function(data) {
            value = data;
            if (STATE_PENDING === this.state) {
                this.state = STATE_FULFILLED;
            }
            trigger();
        }.bind(this);

        /**
         * Change state to rejected.
         *
         * @param  {Mixin} reason
         * @since 0.1.0
         */
        var reject = function(reason) {
            value = reason;
            if (STATE_PENDING === this.state) {
                this.state = STATE_REJECTED;
            }
            trigger();
        }.bind(this);
        /**
         *
         * @param  {Function} onFulfilled
         * @param  {Function} onRejected
         * @return {Promise}
         */
        this.then = function(onFulfilled, onRejected) {
            var self = this;
            return new P(function(resolve, reject) {
                fns.push({
                    onFulfilled: onFulfilled || noop,
                    onRejected: onRejected || noop,
                    resolve: resolve || noop,
                    reject: resolve || noop
                });
                if (STATE_PENDING !== self.state) {
                    trigger();
                }
            });
        };
        /**
         * @param  {Function} onRejected
         * @return {Promise}
         */
        this.catch = function(onRejected) {
            var self = this;
            return new P(function(resolve, reject) {
                fns.push({
                    onFulfilled: noop,
                    onRejected: onRejected || noop,
                    resolve: resolve || noop,
                    reject: resolve || noop
                });
                if (STATE_PENDING !== self.state) {
                    trigger();
                }
            });
        };

        setTimeout(function() {
            func(resolve, reject);
        });
    };
    /**
     * Resolve an object to a Promise object.
     *
     * @param  {Mixin} obj
     * @return {Promise}
     * @since 0.1.0
     */
    P.resolve = function(obj) {
        if (obj instanceof P) {
            return obj;
        } else {
            return new P(function(resolve) {
                resolve(obj)
            });
        }
    };

    /**
     * @param  {Array} sequence
     * @return {Promise}
     * @since 0.1.0
     */
    P.race = function(sequence) {
        var qs = Array.prototype.map.call(sequence, P.resolve, P);
        return new P(function(resolve, reject) {
            if (!qs.length) {
                resolve();
            } else {
                qs.forEach(function(q, idx) {
                    q.then(resolve, reject);
                });
            }
        });
    };
    /**
     * @param  {Array} sequence
     * @return {Promise}
     * @since 0.1.0
     */
    P.all = function(sequence) {
        var qs = Array.prototype.map.call(sequence, P.resolve, P);
        return new P(function(resolve, reject) {
            var resolveCnt = 0,
                ret = [];
            var singleResolve = function(idx, data) {
                ret[idx] = data;
                if (qs.length === ++resolveCnt) {
                    resolve(ret);
                }
                return data;
            };

            if (!qs.length) {
                resolve(ret);
            } else {
                qs.forEach(function(q, idx) {
                    q.then((function(idx) {
                        return singleResolve.bind(null, idx);
                    })(idx), reject);
                });
            }
        });
    };

    return P;
});