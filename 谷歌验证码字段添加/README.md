谷歌验证码Google ReCaptcha的添加使用
===
摘要：

为了方便tp官网个地方能够统一地调用谷歌验证码，现将关于谷歌验证码的功能进行了封装，本文档针对该封装进行了简单说明

---
目录:
- [谷歌验证码Google ReCaptcha的添加使用](#谷歌验证码google-recaptcha的添加使用)
  - [添加步骤](#添加步骤)
    - [前端代码](#前端代码)
    - [后端代码(PHP)](#后端代码php)
  - [整体逻辑](#整体逻辑)
- [关于文档](#关于文档)
  - [版本历史](#版本历史)
  - [评审历史](#评审历史)

---

## 添加步骤
1. 登陆 http://www.google.com/recaptcha/admin 
2. 对新的网站进行注册，会生成两个key。Site key可以公开，用于前端初始化。Secret key用于后台接口对谷歌发送验证请求，请勿放在前端代码。

整体的google相关代码已经封装到统一的js文件`/res/js/pageext/googleRecaptcha.js`(*对应的源码可以查看`/res/js-base/pageext/googleRecaptcha.js`*)

本实例代码使用的是`v2 复选框`版本

### 前端代码
- 在需要的表单内部创建用于存放google验证码的`div`DOM结构（内部原有dom不会改动，创建的验证码模块会插入该dom的末尾）
  ```html
  <div id="form-gr"></div>
  ```
- 引入`googleRecaptcha.js`
  ```html
  <script src="/res/js/pageext/googleRecaptcha.js"></script>
  ```
- 在页面进行google验证码的初始化
  ```js
  googleRecaptcha.grActive($('#form-gr'), {
    lang: '<?php echo $site->lang;?>',
    msgError: '<?php echo $PageText_Security_RecaptchaNotVerified;?>',
    rootUrl: '<?php echo $site->rootUrl;?>'
  })
  ```
- *对于用户完成之后的操作需要进行回调操作的，可以通过修改原有的回调函数`window['googleRecaptcha.grResponseHandler']`,参考如下的代码
  ```js
  const originHandler = window['googleRecaptcha.grResponseHandler']
  function newGoogleHandler(res) {
    originHandler(res);
    $('#form-gr').closest('tr').removeClass('error');
  }
  window['googleRecaptcha.grResponseHandler'] = newGoogleHandler
  ```
- ** 无需针对google验证码进行额外的判断，已通过封装实现了空判断

### 后端代码(PHP)
- 在处理表单的php文件中，针对`google recaptcha`新增的字段进行判断，可以在头部添加如下的额外的代码即可
  ```php
  virtual("/phppage/front-vertication-code.php");
  $recaptcha_res = substr(_post("g-recaptcha-response"),0,8000);
  $isRepcatchaValid = checkRecaptcha($recaptcha_res);
  if(!$isRepcatchaValid){
    echo "Not valid!";
    exit;
  }	
  ```
- *同时为了兼容同一个表单处理php可能会处理不同的表单(`有的带有google验证码，有的不带google验证码`)，在前端使用自动初始化的谷歌验证码的时候会为form表单的`action`链接添加url参数`?hasReCaptcha=true`，可以在后台php中按需使用（比如表单处理接口`addPromotion.php`中使用`isset($_GET['hasReCaptcha'])`进行谷歌验证码判断）


## 整体逻辑
前端逻辑参考[官方文档](https://developers.google.com/recaptcha/docs/display)
1. 前端添加dom结构，指定了谷歌验证码给出的`sitekey`, 用户成功交互后的回调`window['googleRecaptcha.grResponseHandler']`, 以及自定义的错误提示和对应样式
   
   (`sitekey`在[谷歌验证码控制台](https://www.google.com/recaptcha/intro/v3.html)创建站点后可以得到)
    ```javascript
    var styleDOM = '<style>.g-error-msg{visibility: hidden; color: red;}'
    $('head').append(styleDOM)
    var $dom = $('<div class="g-recaptcha" data-sitekey="' + siteKey + '" data-callback="googleRecaptcha.grResponseHandler" ></div><span class="g-error-msg">' + options.msgError + '</span>')
    $el.append($dom)
    ```

2. 利用js添加google官方函数js，在官方链接无法请求成功的时候使用备选链接
    ```javascript
    /** 插入GR的js文件
      * onload googleRecaptcha.grClearTimeout 在js文件加载完成的时候清除延时器
      * onerror googleRecaptcha.grReloadJS 在读取失败的时候直接重新请求另一个接口
      */
      function loadScript(url, loadHandler, errorHandler) {
        var newScript= document.createElement("script");
        newScript.type = "text/javascript";
        newScript.src= url;
        newScript.async = "true";
        newScript.defer = "true";
        newScript.onload = loadHandler
        newScript.onerror = errorHandler
        document.getElementsByTagName("HEAD")[0].appendChild(newScript);
        return newScript
      }
      /** 注册全局带前缀的函数
      * 如果用户读取js文件失败时候则使用另一个js地址
      */
      googleRecaptcha.grReloadJS = function () {
        loadScript('https://recaptcha.net/recaptcha/api.js?hl=' + options.lang)
      }
      // 初始化的时候设置延时，在5s内没有加载完成则请求另一个接口
      var timeoutCheckScriptLoaded = setTimeout(googleRecaptcha.grReloadJS, 5000)

      googleRecaptcha.grClearTimeout = function () {
        clearTimeout(timeoutCheckScriptLoaded)
      }

      loadScript('https://www.google.com/recaptcha/api.js?hl=' + options.lang, googleRecaptcha.grClearTimeout, googleRecaptcha.grReloadJS)
    ```
3. 给所在的`Form`表单添加url参数`hasReCaptcha`
    ```javascript
    // 表单的url添加参数hasReCaptcha，以供表单处理时候进行判断
    var $form = $el.closest('form')
    var formAction = $form.attr('action')
    $form.attr('action', googleRecaptcha.buildUrlAppendParam(formAction, {hasReCaptcha: true}))
    ```
4. 在用户通过验证码验证的时候，设置回调函数。
   
   作为google官方的验证API的补充，请求`storeRecaptcha.php`到服务器存储用户通过认证后从谷歌得到的token，作为备选的服务器认证方案
    ```javascript
    // 注册tp在window下的全局函数以供GR调用
    /** https://developers.google.com/recaptcha/docs/display#g-recaptcha_tag_attributes_and_grecaptcharender_parameters
    * Google Recaptcha 当用户成功进行了加载之后的操作
    * - options 初始化传入的参数
    * - $el: 新建的jq元素
    * - $msg: 错误提示的jq元素
    * @param {Object} grRes 官方返回的g-recaptcha-response
    */
    window['googleRecaptcha.grResponseHandler'] = function (grRes) {
      $msg.css({visibility:"hidden"});
      $el.addClass(googleRecaptcha.passClass)
      $.ajax({
        type:'post',
        url: options.rootUrl + 'storeRecaptcha.php',
        data: {
          recaptcha: grRes
        }
      })
    }
    ```

5. 给所在的`Form`表单添加验证码是否通过的判断
    ```javascript
    // 表单提交时候判断用户是否通过验证(根据类)
    $form.on('submit', function(ev) {
      if (!$el.hasClass(googleRecaptcha.passClass)) {
        ev.preventDefault()
        $msg.css({visibility: "visible"})
        $(this).removeClass('forbid')
        return false
      } else {
        $msg.css({visibility: "hidden"})
      }
    })
    ```

后端逻辑通过服务器请求google提供的认证API以及服务器本身使用redis存储用户的token作为备选方案


1. 服务器存储用户通过后从google得到的token——`storeRecaptcha.php`
    ```php
    <?php
    if(!isset($isConnect)){
      virtual("/phppage/common.php?".$_SERVER["QUERY_STRING"]);
    }
    $recaptcha = $_POST["recaptcha"];
    global $redis;
    $redis->setex( "recaptcha-".$recaptcha ,60, $recaptcha); 
    echo "{success:true}";
    ?>
    ```
    - 在用户完成了判断之后提交到该php文件下，存储用户的google token到redis

2. 在处理表单的php逻辑中，针对google验证码自动添加的字段`g-recaptcha-response`进行处理判断
   
    （需要引用全局定义的`front-vertication-code.php`内部给出的函数`checkRecaptcha`来进行判断）
    ```php
    virtual("/phppage/front-vertication-code.php");
    $recaptcha_res = substr(_post("g-recaptcha-response"),0,8000);
    $isRepcatchaValid = checkRecaptcha($recaptcha_res);
    if(!$isRepcatchaValid){
      echo "Not valid!";
      exit;
    }	
    ```
3. 在判断逻辑中(`front-vertication-code.php`下的`checkRecaptcha()`函数)，优先进行google官方api接口请求认证，无法认证之后进行服务器本地的redis已存储的token进行判断
    ```php
    function checkRecaptcha($recaptcha_res){
      $apiKey = '...';
      global $redis;
      $googleApi = checkRecaptchaPost('https://www.google.com/recaptcha/api/siteverify', array(
        'secret' => $apiKey,
        'response' => $recaptcha_res
      ));
      // 错误时候返回404的html字符串
      if ($googleApi && isset($googleApi->success)) {
        if ($googleApi->success === true) {
          $redis->del("recaptcha-".$recaptcha_res);
          return true;
        } else {
          echo 'Access deny, please refresh you page!';
          return false;
        }
      } else {
        // google请求失败的时候使用redis判断
        if(!$redis->exists("recaptcha-".$recaptcha_res))
        {
          echo 'Access deny, please refresh you page!';
          return false;    
        } else {
          $redis->del("recaptcha-".$recaptcha_res);
          return true;
        }
      }
    }
    ```
  
---
# 关于文档
## 版本历史
|时间|撰写人|版本|
|:--:|:--:|:--:|
|2020.04.17|tobin.xu|V0.1|

## 评审历史
|时间|评审人|评审建议|
|:--:|:--:|:--:|
|-|-|-|
