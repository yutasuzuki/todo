var gulp,sass,connect;
    gulp = require('gulp');
    sass = require('gulp-ruby-sass');
    connect = require('gulp-connect');
 
gulp.task('sass',function(){
  gulp.src('./sass/*.scss')
    .pipe(sass({style : 'expanded'})) //出力形式の種類　#nested, compact, compressed, expanded.
    .pipe(gulp.dest('./css'));        //cssの出力先ディレクトリ
});
 
//ローカルサーバー
gulp.task('connectDev',function(){
  connect.server({
    root: ['./'],   //ルートディレクトリ
    port: 8001,     //ポート番号
    livereload: true
  });
});
 
//htmlタスク
gulp.task('html',function(){
    gulp.src('./*.html')            //実行するファイル
        .pipe(connect.reload());    //ブラウザの更新
});
 
//ファイルの監視
gulp.task('watch',function(){
    gulp.watch(['./*.html'],['html']);          //htmlファイルを監視
    gulp.watch(['./sass/*.scss'],['sass']); //scssファイルを監視
    gulp.watch(['./css/*.css'],['html']);       //cssファイルを監視
});
 
gulp.task('default',['watch','connectDev']);