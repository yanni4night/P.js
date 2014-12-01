/**
 * Copyright (C) 2014 yanni4night.com
 * P_test.js
 *
 * changelog
 * 2014-12-01[11:16:40]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */

'use strict';
var P = require('../p');
/*jshint camelcase: false */
exports.P = {
    setUp: function(done) {
        done();
    },
    basic_then: function(test) {
        test.expect(1);
        new P(function(resolve) {
            setTimeout(resolve.bind(null, 34), 500);
        }).then(function(data) {
            test.deepEqual(data, 34, 'data from then should be 34');
            test.done();
        });
    },
    basic_catch: function(test) {
        test.expect(1);
        new P(function(resolve, reject) {
            setTimeout(reject.bind(null, 'error'), 500);
        }).catch(function(data) {
            test.deepEqual(data, 'error', 'data from then should be "error"');
            test.done();
        });
    },
    basic_resolve: function(test) {
        test.expect(1);
        P.resolve(123).then(function(data) {
            test.deepEqual(data, 123, 'data from then should be 123');
            test.done();
        });
    },
    basic_all: function(test) {
        test.expect(2);
        var sp = new P(function(resolve) {
            setTimeout(resolve.bind(null, 7), 500);
        });
        P.all([9, 8, sp]).then(function(data) {
            test.ok(Array.isArray(data), 'data should be an array');
            test.deepEqual(data[2], 7, 'data[2] from then should be 7');
            test.done();
        });
    },
    basic_race: function(test) {
        test.expect(1);
        var sp1 = new P(function(resolve) {
            setTimeout(resolve.bind(null, 45), 500);
        });
        var sp2 = new P(function(resolve) {
            setTimeout(resolve.bind(null, 56), 1500);
        });
        P.race([sp1, sp2]).then(function(data) {
            test.deepEqual(45, data, 'data[2] from then should be 45');
            test.done();
        });
    },
    chain_then: function(test) {
        test.expect(2);
        new P(function(resolve) {
            setTimeout(resolve.bind(null, 34), 500);
        }).then(function(data) {
            test.deepEqual(data, 34, 'data from then should be 34');
            return 67;
        }).then(function(data) {
            test.deepEqual(data, 67, 'data from then should be 67');
            test.done();
        });
    },
    chain_catch: function(test) {
        test.expect(2);
        new P(function(resolve, reject) {
            setTimeout(reject.bind(null, 34), 500);
        }).catch(function(data) {
            test.deepEqual(data, 34, 'data from catch should be 34');
            return 67;
        }).then(function(data) {
            test.deepEqual(data, 67, 'data from then should be 67');
            test.done();
        });
    },
    state_pending_after_then_or_catch: function(test) {
        test.expect(2);
        test.deepEqual('pending', P.resolve(67).then(function(data) {
            test.deepEqual(67, data, 'data from then should be 67');
            test.done();
        }).state, 'state should be "pending" immediately');
    }
};
