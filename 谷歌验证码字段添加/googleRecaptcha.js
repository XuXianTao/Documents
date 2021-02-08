// <-- Google Recaptcha 谷歌验证码v2 -->
var googleRecaptcha = {
	passClass: 'gr-pass'
}
/**
 * 根据传入的url字符串自动解析出对应Object
 * (没有等号的单个参数会被滤除)
 * @param {String} paramStr url的搜索参数(不带问号), eg. a=4&c=1
 * @return {Object} 构建出搜索字符串对应的Object
 */
googleRecaptcha.buildParamObj = function(paramStr) {
  function paramFilter(str) {
    return decodeURIComponent(str.replace(/\+/g, ' '))
  }
  var searchStrArr = paramStr.split('&')
  var resultObj = {}
  for (var i = 0; i < searchStrArr.length; i++) {
    var kv = searchStrArr[i].split('=')
    if (kv.length === 1 || !kv[0]) continue
    var k = kv[0]
    var v = paramFilter(kv[1])
    if (resultObj[k] instanceof Array) {
      resultObj[k].push(v)
    } else if (resultObj[k]) {
      resultObj[k] = [resultObj[k]]
      resultObj[k].push(v)
    } else if (!resultObj[k]) {
      resultObj[k] = v
    }
  }
  return resultObj
}
/**
 * 根据传入的Obj构建搜索字符串
 * @param {Object} params 用于转化为搜索字符串的对象
 * @return {String} 返回搜索字符串
 */
googleRecaptcha.buildSearchString = function(params) {
	var paramArr = []
  for (var key in params) {
    paramArr.push(key + '=' + params[key])
  }
	var URLStr = paramArr.join('&')
	var searchStr = '?' + URLStr
	return searchStr
}
/**
 * 在原有url基础上添加额外的搜索参数
 * (会滤除原本没有等号的参数)
 * @param {String} url 原始url
 * @param {Object} params 需要添加的额外参数
 * @return {String} 构建好的新url
 */
googleRecaptcha.buildUrlAppendParam = function(url, params) {
  var hasSearch = url.indexOf('?') > -1
  if (!hasSearch) return url + googleRecaptcha.buildSearchString(params)
  var search = url.slice(url.indexOf('?') + 1)
  var searchObj = googleRecaptcha.buildParamObj(search)
  for (var key in params) {
    searchObj[key] = params[key]
  }
  var newParamStr = googleRecaptcha.buildSearchString(searchObj)
  var baseUrlPath = url.slice(0, url.indexOf('?'))
  return baseUrlPath + newParamStr
}
/**
 * 激活对应标签为GR验证码
 * @param {Object} $el 需要进行替换的标签
 * @param {lang} options {lang: 国家语言, msgError: 验证不通过的消息, rootUrl}
 */
googleRecaptcha.grActive = function ($el, options) {
  if (!$el || !$el.length) return
  options = options || {}
  // 构建自动生成的验证码DOM结构
	var siteKey = '...'
  var styleDOM = '<style>.g-error-msg{visibility: hidden; color: red;} .error .g-error-msg{visibility:visible;}</style>'
  $('head').append(styleDOM)
  var $dom = $('<div class="g-recaptcha" data-sitekey="' + siteKey + '" data-callback="googleRecaptcha.grResponseHandler" ></div><span class="g-error-msg">' + options.msgError + '</span>')
  $el.prepend($dom)
  var $msg = $el.find(".g-error-msg")

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
  // 表单的url添加参数hasReCaptcha，以供表单处理时候进行判断
  var $form = $el.closest('form')
  var formAction = $form.attr('action')
  $form.attr('action', googleRecaptcha.buildUrlAppendParam(formAction, {hasReCaptcha: true}))

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

  // 注册tp在window下的全局函数以供GR调用
  /** https://developers.google.com/recaptcha/docs/display#g-recaptcha_tag_attributes_and_grecaptcharender_parameters
   * Google Recaptcha 当用户成功进行了加载之后的操作
   * @param {Object} grRes 官方返回的g-recaptcha-response
   * @param {Object} options {rootUrl, $el: 新建的jq元素}
   */
  window['googleRecaptcha.grResponseHandler'] = function (grRes) {
    $msg.css({visibility:"hidden"});
    $el.addClass(googleRecaptcha.passClass)
    if (window['googleRecaptcha.grResponseHandlerExtra']) {
      window['googleRecaptcha.grResponseHandlerExtra']()
    }
    $.ajax({
      type:'post',
      url: '/phppage/storeRecaptcha.php',
      data: {
        recaptcha: grRes
      }
    })
  }
};

// <[End]-- Google Recaptcha 谷歌验证码v2 -->
