module.exports = (grunt)=>

    (require 'time-grunt') grunt
    (require 'load-grunt-tasks') grunt
    grunt.initConfig
        jshint:
            options:
                jshintrc: '.jshintrc'
            all: ['p.js', 'test/*.test.js']
        mochaTest:
            src: ['test/*.test.js']
        coveralls:
            all:
                src: 'coverage/lcov.info'

    grunt.registerTask 'test', ['mochaTest']
    grunt.registerTask 'default', ['jshint', 'test']
    