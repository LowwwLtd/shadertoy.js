module.exports = function( grunt ) {

    grunt.initConfig( {
        pkg: grunt.file.readJSON( 'package.json' ),
        uglify: {
            options: {
                banner: '/**\n * @author: Andre Venancio [andre@lowwwltd.com]\n * version: <%= pkg.version %> [<%= grunt.template.today("yyyy-mm-dd") %>]\n */\n'
            },
            build: {
                src: 'source/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        }
    } );

    grunt.loadNpmTasks( 'grunt-contrib-uglify' );

    grunt.registerTask( 'default', [ 'uglify' ] );

};
