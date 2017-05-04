var gulp = require('gulp'),
     useref = require('gulp-useref'),
     gulpif = require('gulp-if'),
     uglify = require('gulp-uglify'),
     uncss = require('gulp-uncss'),
     jade = require('gulp-jade'),
     sass = require('gulp-sass'),
     imagemin = require('gulp-imagemin'),
     pngquant = require('imagemin-pngquant'),
     autoprefixer = require('gulp-autoprefixer'),
     minifyCss = require('gulp-minify-css'),
     spritesmith = require('gulp.spritesmith'),
     browserSync = require('browser-sync'),
     clean = require('gulp-clean'),
     cache = require('gulp-cache'),
     notify = require('gulp-notify'),
     htmlmin = require('gulp-htmlmin'),
     htmlhint = require("gulp-htmlhint"),
     replace = require('gulp-replace'),
     fs = require('fs');

// Browser-sync
gulp.task('browser', function(){
  browserSync({
    server: {
      baseDir: 'app',
    },
    notify: false,
    browser: ["ie"],
  })
});

// Cleaner
gulp.task('clean', function () {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

// Clear Cache
gulp.task('clear', function () {
  return cache.clearAll();
});

// Fonts
gulp.task('fonts', function(){
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

gulp.task('htaccess', function(){
  return gulp.src('app/.htaccess')
  .pipe(gulp.dest('dist/'))
});

// Sprites JPG PNG
gulp.task('sprite', function () {
  var spriteData = gulp.src('app/img/icons/**/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.sass',
    padding: 10
  }));
  return spriteData.pipe(gulp.dest('app/css'));
});

 // PHP
 gulp.task('php', function(){
  return gulp.src('app/php/**/*')
  .pipe(gulp.dest('dist/php'))
});

 // Javascript
 gulp.task('java', function(){
  return gulp.src('app/scripts/angular/**/*')
  .pipe(gulp.dest('dist/scripts/angular'))
});

// Image-min
gulp.task('img', () => {
    return gulp.src(['app/img/**','app/css/*.png'],{base: 'app'})
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist'));
});

// Jade
gulp.task('jade', function() {
var config = JSON.parse(fs.readFileSync('app/content.json'));

     gulp.src('app/**/**/**/*.jade')
    .pipe(jade({
      locals: config,
      pretty: true
    }))
    .on('error', notify.onError(function(err){
      return{
        title: 'ERORR in JADE',
        message: err.message,
        sound: true,
        icon: 'notify.png'
      }
    }))
    .pipe(gulp.dest('app/'))
});

// Autoprefix css
gulp.task('uncss', function () {
    return gulp.src('dist/css/*.css')
        .pipe(uncss({
        html: ['dist/index.html']
        }))
        .pipe(autoprefixer({
            browsers: ['last 40 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('dist/css'));
});

// Sass
gulp.task('sass', function () {
  return gulp.src('app/sass/**/*.sass')
    .pipe(sass.sync().on('error', notify.onError(function(err){
      return{
        title: 'Erorr in SASS',
        message: err.message,
        sound: true,
        icon: 'notify.png'
      }
    })))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream: true}))
});

// HtmL
gulp.task('html', function() {
  return gulp.src('dist/*.html')
    .pipe(htmlhint())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(replace('<!--Styles--><link rel="stylesheet" href="css/vendor.min.css"><link rel="stylesheet" href="css/main.min.css">', ''))
    .pipe(gulp.dest('dist'))
});


// Watching
gulp.task('watch', ['browser', 'sass', 'jade'], function () {
    gulp.watch('app/**/*.jade', ['jade']);
    gulp.watch('app/sass/**/*.sass', ['sass']);
    gulp.watch('app/**/*.json', ['jade']);
    gulp.watch('app/**/*.html', browserSync.reload);
    gulp.watch('app/scripts/**/*.js', browserSync.reload);
});

// Builder
gulp.task('build',['img','fonts', 'php', 'java', 'htaccess'], function () {
    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('dist'));
});
