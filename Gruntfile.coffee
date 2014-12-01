module.exports = (grunt)=>

    (require 'time-grunt') grunt
    (require 'load-grunt-tasks') grunt
    grunt.initConfig
        jshint:
            options:
                jshintrc: '.jshintrc'
            all: ['p.js']
        nodeunit:
            test: ['test/*_test.js']

    grunt.registerTask 'test', ['nodeunit']
    grunt.registerTask 'default', ['jshint', 'test']
    