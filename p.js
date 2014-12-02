/**
 * Copyright (C) 2014 yanni4night.com
 * p.js
 *
 * changelog
 * 2014-11-30[16:05:07]:revised
 * 2014-12-01[10:57:13]:better invoke
 * 2014-12-02[10:17:14]:add P.reject
 *
 * @author yanni4night@gmail.com
 * @version 0.1.2
 * @since 0.1.0
 */

(function(global, factory) {
    'use strict';
    if ('undefined' !== typeof define && define.amd) {
        define(factory);
    } else if ('undefined' !== typeof module && module.exports) {
        module.exports = factory();
    } else {
        global.P = factory();
    }
})(this, function() {
    'use strict';
    var noop = function(args) {
        return args;
    };

    var STRFUNC = typeof noop;
    var STATE_PENDING = 'pending';
    var STATE_FULFILLED = 'fulfilled';
    var STATE_REJECTED = 'rejected';

    var isFunction = function(obj) {
        return STRFUNC === typeof obj;
    };

    /**
     * Promise constructor.
     *
     * @param {Function} func
     * @class
     * @since 0.1.0
     */
    var P = function(func) {
        this.state = STATE_PENDING;
        var fns = [];
        var value;

        if (!isFunction(func)) {
            throw new TypeError('Promise resolver ' + func + ' is not a function');
        }

        /**
         * Trigger events
         * @since 0.1.0
         */
        var trigger = function() {
            var fn;

            if (STATE_PENDING === this.state) {
                return;
            }

            while ((fn = fns.shift())) {
                //resolve&reject always exists
                if (STATE_FULFILLED === this.state) {
                    fn.resolve(fn.onFulfilled.call(null, value));
                } else if (STATE_REJECTED === this.state) {
                    fn.reject(fn.onRejected.call(null, value));
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
            return new P(function(resolve) {
                fns.push({
                    onFulfilled: isFunction(onFulfilled) ? onFulfilled : noop,
                    onRejected: isFunction(onRejected) ? onRejected : noop,
                    resolve: isFunction(resolve) ? resolve : noop,
                    reject: isFunction(resolve) ? resolve : noop
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
            return new P(function(resolve) {
                fns.push({
                    onFulfilled: noop,
                    onRejected: isFunction(onRejected) ? onRejected : noop,
                    resolve: isFunction(resolve) ? resolve : noop,
                    reject: isFunction(resolve) ? resolve : noop
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
    P.resolve = function(value) {
        if (value instanceof P) {
            //Return a new promise follow the value if it's thenable
            return new P(function(resolve, reject) {
                value.then(resolve, reject);
            });
        } else {
            return new P(function(resolve) {
                resolve(value);
            });
        }
    };

    /**
     * @param  {Mixin} reason
     * @return {Promise}
     * @since 0.2.0
     */
    P.reject = function(reason) {
        //Treat as a reason even reason is thenable
        return new P(function(resolve, reject) {
            reject(reason);
        });
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
                qs.forEach(function(q) {
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