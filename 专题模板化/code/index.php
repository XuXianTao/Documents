<!DOCTYPE html>
<html lang="en">

<head>
  <script>
    var modules = <?php
      $staticModulePath = './template';
      function getDirs($path) {
        $files = scandir($path);
        $files = array_values(array_filter($files, function($item)use($path) {
          return is_dir($path . '/' . $item) && $item !== '.' && $item !== '..';
        }));
        return $files;
      }
      $blocks = getDirs($staticModulePath);
      foreach ($blocks as $k => $item) {
        $blocks[$k] = [
          'title' => $item,
          'templates' => getDirs($staticModulePath . '/' .$item)
        ];
      }
      echo json_encode($blocks);
    ?>;
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title> MODULES</title>
  <!--[if lt IE 9]>
    <script src="/assets/js/hack/html5shiv.js"></script>
    <script src="/assets/js/hack/selectivizr-min.js"></script>
  <![endif]-->
  <!-- <link rel="stylesheet" href="/assets/js/plugins/swiper-5.4.1/swiper.min.css"> -->
  <link rel="stylesheet" href="/assets/css/common.css">
  <link rel="stylesheet" href="/assets/images/product/_modules/template-css/style_global.css">

  <link rel="stylesheet" href="/assets/images/product/_modules/style.css">
  
  <link rel="stylesheet" href="/assets/images/product/_modules/template/style-sample.css">
</head>

<body>
  <div class="_modules">
    <h1>Topic Modules</h1>
    <label>
      <div class="tp-btn tp-btn-l tp-btn-global-css">Golabel Style</div>
      <textarea id="textarea-global-style" cols="100" rows="10" readonly><?php include('template-css/style_global.css') ?></textarea>
    </label>
  </div>
  <dl class="series" id="icons">
    <style>
      #icons img{max-width:100%;max-height:100%;margin:auto;display: block;}
      #icons .desc {position: absolute; bottom: 0;left: 0; font-size:16px;}
      #icons .template-item {height: 50px;transition:.5s;}
      #icons .template-item_content {height: 100%;}
      #icons .template-item:hover {background: rgba(0,0,0, .5); height: 250px;}
    </style>
    <dt><a href="#icons">icons</a></dt>
    <dd class="overview-content">
      <?php 
      $iconUrlPath = '/assets/images/icon';
      $iconPath = $_SERVER['ROOT_DIR'] . $iconUrlPath;
      $icons = array_filter(scandir($iconPath), function($item)use($path) {
        return $item !== '.' && $item !== '..';
      });
      foreach ($icons as $icon) {
        echo "<div class=\"template-item\">
          <div class=\"desc\">$iconUrlPath/$icon</div>
          <div class=\"template-item_content\">
            <img src=\"$iconUrlPath/$icon\">
            <textarea class=\"template-item_textarea template-item_textarea-html\">$iconUrlPath/$icon</textarea>
          </div>
          <div class=\"actions\">
            <div class=\"tp-btn btn-html\">IMGPATH</div>
          </div>
        </div>";
      }
      ?>
    </dd>
  </dl>
  <script src="/assets/js/jquery/jquery-1.9.1.min.js"></script>
  <!-- <script src="/res/js/pageext/main.js"></script> -->
  <!-- <script src="/assets/js/plugins/swiper-5.4.1/swiper.min.js"></script> -->
  <script src="/assets/images/product/_modules/script.js"></script>
</body>

</html>