module.exports = (grunt)=>

    (require 'time-grunt') grunt
    (require 'load-grunt-tasks') grunt
    grunt.initConfig
        jshint:
            options:
                jshintrc: '.jshintrc'
            all: ['p.js', 'test/*_test.js']
        nodeunit:
            test: ['test/*_test.js']
        coveralls:
            all:
                src: 'coverage/lcov.info'

    grunt.registerTask 'test', ['nodeunit']
    grunt.registerTask 'default', ['jshint', 'test']
    