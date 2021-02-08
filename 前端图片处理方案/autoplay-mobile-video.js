/**
 * 手机端针对autoplay的video设置对应控制兼容方案
 * created 2021.2.5
 * @author tobin.xu
 */
$(function () {
  if ($(window).width() <= 1024) {
    var $videoAutoplay = $('video[autoplay]')
    $videoAutoplay.attr({
      poster: '/assets/images/icon/youtube-play-bg.png', // 设置无法播放时候的静态帧
      muted: true, // 静音，部分设备要求静音才允许自动播放
      autoplay: 'autoplay', // 自动播放
      playsinline: true, // 行内播放，ios的自动播放要求设置playsinline
      preload: 'auto', // 预加载资源
      'x5-video-player-type': 'h5-page', // 微信端使用同层播放器，避免视频组件浮起遮挡
      'webkit-playsinline': true // 低版本ios进行行内播放的兼容
    }).css({
      overflow: 'hidden',
      'object-fit': 'cover' // 缩放视频并截取部分，避免出现黑边
    });
    // 页面加载后使用js进行播放
    $(window).on('load scroll', function touchHandler() {
      $videoAutoplay.each(function() {
        $(this)[0].play()
      })
      $(window).off('load scroll', touchHandler)
    })
    // 如果页面发现存在无法自动播放的视频，需要添加事件实现点击后播放
    setTimeout(function() {
      var $videoPaused = $videoAutoplay.filter(function() { return $(this)[0].paused; })
      if ($(window).width() <= 1024 && $videoPaused.length > 0) {
        $videoAutoplay.on('click', function() {
          $(this)[0].play()
        })
      }
    }, 500)
  }
})