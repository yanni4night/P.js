/**
 * Copyright (C) 2014 yanni4night.com
 * q.js
 *
 * changelog
 * 2014-11-30[16:05:07]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */

(function(global, factory) {
    "use strict";
    if ('undefined' !== typeof define && define.amd) {
        define('P', [], factory);
    } else if ('undefined' !== typeof module && module.exports) {
        module.exports = factory();
    } else {
        global.P = factory();
    }

})(this, function() {
    "use strict";
    var P = function(func) {
        var state = this.state = 'pending';
        this.resolvers = [];
        this.rejecters = [];
        var value = undefined;

        var trigger = function(resolved) {
            var ret, resolver, rejector;
            if (resolved && 'resolved' === this.state) {
                while (resolver = this.resolvers.shift()) {
                    resolver(value);
                }
            } else if (!resolved && 'rejected' === this.state) {
                while (rejector = this.rejecters.shift()) {
                    rejector(value);
                }
            }
        }.bind(this);

        var resolve = function(data) {
            value = data;

            if ('pending' === this.state) {
                this.state = 'resolved';
            }

            trigger(true);
        }.bind(this);

        var reject = function(reason) {
            value = reason;
            if ('pending' === this.state) {
                this.state = 'rejected';
            }
            trigger(false);
        }.bind(this);
        /**
         * [then description]
         * @param  {[type]} onFulfilled [description]
         * @param  {[type]} onRejected  [description]
         * @return {[type]}             [description]
         */
        this.then = function(onFulfilled, onRejected) {
            var ret, done, self = this,
                t2resolve;
            if ('function' === typeof onFulfilled) {
                this.resolvers.push(function() {
                    ret = onFulfilled(value);
                    done = true;
                    t2resolve && t2resolve(ret);
                });
                trigger(true);
            }

            this.catch(onRejected);

            return new P(function(resolve, reject) {
                if (done) resolve(true);
                else {
                    t2resolve = resolve;
                }
            });
        };
        /**
         * [catch description]
         * @param  {[type]} onRejected [description]
         * @return {[type]}            [description]
         */
        this.catch = function(onRejected) {
            var ret, done, t2reject;
            this.rejecters.push(function() {
                ret = onRejected(value);
                done = true;
                t2reject && t2reject(ret);
            });
            trigger(false);

            return new P(function(resolve) {
                if (done) resolve(ret);
                else {
                    t2reject = resolve;
                }
            });
        };

        setTimeout(function() {
            func(resolve, reject);
        });
    };

    P.resolve = function(obj) {
        if (obj instanceof P) {
            return obj;
        } else {
            return new P(function(resolve) {
                resolve(obj)
            });
        }
    };

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