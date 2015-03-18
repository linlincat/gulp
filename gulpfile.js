//引入 gulp
var gulp = require('gulp');

//引入插件 给予ruby的 sass的编译
var sass = require('gulp-ruby-sass');

//压缩css
var minifycss = require('gulp-minify-css');

//js代码校验
var jshint = require('gulp-jshint');

//合并js/css文件
var concat =require('gulp-concat');

//压缩js代码
var uglify =require('gulp-uglify');

//自动添加css前缀
var autoprefixer = require('gulp-autoprefixer');

//压缩图片
var imagemin = require('gulp-imagemin');

//自动刷新页面
var livereload = require('gulp-livereload');

//图片缓存，只有图片替换了才压缩
var cache = require('gulp-cache');

//更改提醒
var notify = require('gulp-notify');

// 重命名
var rename = require('gulp-rename');

//控指制台查找scss对应指定目标
var sourcemaps = require('gulp-sourcemaps');

//清除文件
var del = require('del');

/*编译sass
注释：由于使用ruby-sass所以编译出错的时候不会报错
      如果使用gulp-sass的，watch报错的时候，就会停止操作需要重新编译
      需要注意的部分，需要添加.on来判断下，不然就算成功了，也不会输出
      到指定目标
      //或许是编译插件的问题，导致无法添加注释，会编译出错。
      注释编译出错的解决方法是加入@charset "utf-8";就可以看，
      切记要放做第一行
功能：找到相应的scss路径下的scss文件
	  自动添加兼容前缀
	  修改扩展名且对CSS文件进行压缩，输出到指定目标
	  成功后输出提示注释*/
gulp.task('styles', function() {
    return sass('styles/', { sourcemap: true }) 
    .on('error', function (err) {
      console.error('Error!', err.message);
   })
    .pipe(autoprefixer({
		browsers: ['last 200 versions', '> 0.1%', 'Firefox ESR', 'Opera 12.1']
	}))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(sourcemaps.write()
    //添加'map'就可以做控制台看scss具体地址
    //.pipe(sourcemaps.write('map'))
    .pipe(gulp.dest('dist/css'))
    .pipe(notify({ message: 'style task complete'}));
});

/*合并JS文件
注释：将分散的JS文件，合并成一个单一的JS文件
      修改文件扩展名后进行压缩,已将检测JS语法的功能注销
功能：找出源JS所在路径，进行统一合并
	  修改扩展名，随后进行JS压缩
	  输出到指定目录，完成后提示注释
*/
gulp.task('scripts', function() {
	gulp.src('js/**/*.js')
		.pipe(concat('main.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		// .pipe(jshint('.jshintrc'))
  		//.pipe(jshint.reporter('default'))
		.pipe(gulp.dest('dist/js'))
		.pipe(notify({ message: 'scripts task complete'}));
});

/*进行Images压缩
注释：imagemin这个插件本身是进行图片压缩的
      放在cache里面，这个时候只有新建或者修改过的图片才会被压缩
功能：找到收集到的所有需要压缩的图片的路径
	  optimizationLeve优化等级 progressive渐变 interlaced交错
	  输出到指定目录，完成后提示注释*/
gulp.task('images', function() {
	gulp.src('img/**/*')
		.pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
		.pipe(gulp.dest('dist/images'))
		.pipe(notify({ message: 'images task compleate'}))
});

/*Clean 清除文件
注释：针对一些加时间戳的问题，重新生成一些文件，时刻保持最新的文件
	  即使新生成的文件会覆盖老文件。
功能：删除对应目录下的文件*/
gulp.task('clean', function(cb) {
	del(['dist/css', 'dist/js', 'dist/images'], cb);
});

/*Default task 默认执行任务
注释：执行自定义添加的任务
功能：可以对应执行相应的文件，也可以执行默认的，执行数值内
	  对应的文件。
	  可以直接运行gulp就可以，或者运行gulp default
	  先执行clean命令，目的是为了优先执行clean
	  然后执行style, script, images
	  如果不用start的方式也也可以用gulp.run*/
gulp.task('default', ['clean'], function() {
	gulp.start('styles', 'scripts', 'images');
});

/*Watch 监控文件改变
注释：如果文件有所改变，则进行重新编译,安装插件后，会
      自动插入文本里面一个script脚本，用来监控页面的变化
      首先创建一个刷新监听，等目标文件有变化后，就会执行
      liverload插件需要做命令行启动下，否则插件无法启动
      
功能：可以统一监控，也可以下如下一一针对暂且把重新载入
      需要做服务器端才能展示这个功能，所以需要做chorm里
      载入一个liverload插件
      当监控开始的时候，就可以实时刷新页面了，如果修改了
      已经生成的文件，那么就只针对已经生成的产生变化，并
      不会影响源文件*/
gulp.task('watch', function() {
	gulp.watch('styles/**/*.scss', ['styles']);
	gulp.watch('js/**/*.js', ['scripts']);
	gulp.watch('img/**/*', ['images']);

	livereload.listen();
	gulp.watch(['dist/**/*'], function(event){  
        livereload.changed(event.path);  
    });  
});