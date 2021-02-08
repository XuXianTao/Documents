/**
 * 专题模板页面的构造逻辑，通过ajax请求获取模板目录列表，构造{板块}-{模板}结构
 * @author tobin.xu
 * @since 2020.12.09
 */
// js渲染组件列表
var $main = $('._modules')

/**
 * 根据板块和模板，找到对应的html文件目录
 * @param {string} blockName 板块名称
 * @param {string} templateName 模板名称
 */
function buildTemplateDOMPath(blockName, templateName) {
  return './template/' + blockName + '/' + templateName + '/index.html';
}

/**
 * 根据板块和模板，找到对应的css文件目录
 */
function buildTemplateCSSFilePath(blockName, templateName) {
  return buildTemplateDOMPath(blockName, templateName).replace('index.html', 'style-template.css')
}

// 压缩html字符串（去除两个标签中间的空白符）
function compressHTML(str) {
  var regex = new RegExp('(>)\\s+(<)', 'g')
  return $.trim(str).replace(regex, '$1$2')
}
/**
 * 获取开始结束字符串中间的部分
 * @param {string} fileContent 需要进行截取的字符串值
 * @param {string} startStr 开始的字符串
 * @param {string} endStr 结束字符串
 * @param {boolean} ignoreCompress 是否需要对结果进行压缩
 */
function findContentThroughStr(fileContent, startStr, endStr, ignoreCompress) {
  ignoreCompress = ignoreCompress || false
  var startIndex = fileContent.indexOf(startStr)
  var endIndex = fileContent.indexOf(endStr)
  var finalContent = $.trim(fileContent.slice(startIndex, endIndex).replace(/<!--.*-->/g, ''))
  var result = !ignoreCompress ? compressHTML(finalContent) : finalContent
  return result
}

/**
 * 常量定义
 */
var BASEINFO = {
  ACTION_BTNS: [
    {
      title: 'HTML',
      findAreaText: function(blockName, templateName, $itemDom) {
        var $itemSection = $itemDom.find('.section')
        if ($itemSection.length) {
          return $itemSection[0].outerHTML
        } else {
          return $.get(buildTemplateDOMPath(blockName, templateName)).then(function(res) {
            return findContentThroughStr(res, '<!-- [DOM] -->', '<!-- [DOM End] -->', true)
          })
        }
      }
    },
    {
      title: 'CSS',
      btnClass: 'tp-btn-brand',
      findAreaText: function(blockName, templateName, $itemDom) {
        function addPrefixPostfix(str) {
          blockName = blockName == 'base' ? '' : blockName + '-'
          return '/* [START] ' + blockName + templateName + '.css */'
          + str
          + '/* [END] ' + blockName + templateName + '.css */'
        }
        var domValue = $itemDom.find('.template-item_textarea-css').val()
        if (domValue && domValue.length) {
          return addPrefixPostfix(domValue)
        } else {
          return $.get(buildTemplateCSSFilePath(blockName, templateName)).then(function(res) {
            return addPrefixPostfix(res)
          })
        }
      }
    }
  ]
}
$(function() {

  // 添加移动端的iframe结构
  function appendMobileFrame($templateItem, domSrc) {
    var $mobileFrame = $('<iframe></iframe>')
      .addClass('template-item_iframe')
      .attr('src', domSrc);
    $templateItem.append($mobileFrame)
  }

  /**
   * 返回某个模块下构造模板dom结构的函数（用于循环）
   * @param {string} blockName 模块名字
   * @param {jQuery} $overviewContent 模块（包含很多模板）的jq对象
   */
  function buildTemplateItmeDOM(blockName, $overviewContent) {
    /**
     * 根据模板名称进行dom结构的构造
     * @param {string} templateName 模板名称
     */
    return function(templateName) {
      var itemWrapper = document.createElement('div')
      itemWrapper.classList.add('template-item')
      var itemContent = document.createElement('div')
      itemContent.classList.add('template-item_content')
      // 获取文件dom结构
      var ajaxGet = $.get(buildTemplateDOMPath(blockName, templateName))
        .then(function(res) {
          var compressDOMStr = findContentThroughStr(res, '<!-- [Template Start] -->', '<!-- [Template End] -->', true)
          var $templateDOM = $(compressDOMStr)
          $(itemContent).append($templateDOM)
        })
      // 添加a链接，跳转模板的对应页面
      var $linkDom = $('<a></a>').attr({
        target: '_blank',
        href: '/assets/images/product/_modules/template/' + blockName + '/' + templateName + '/'
      }).addClass('template-item_link')
      $(itemContent).append($linkDom)
      // 根据ACTION_BTNS定义，构建各个btn的对应的textarea拷贝内容
      BASEINFO.ACTION_BTNS.forEach(function(item) {
        ajaxGet = ajaxGet.then(function() {
          return item.findAreaText(blockName, templateName, $(itemWrapper))
        }).then(function(res) {
          var $textarea = $('<textarea></textarea>')
            .addClass('template-item_textarea')
            .addClass('template-item_textarea-' + item.title.toLowerCase())
          $textarea.text(res)
          $(itemContent).append($textarea)
        })
      })
      itemWrapper.appendChild(itemContent)
      var $actions = $('<div></div>').addClass('actions')

      BASEINFO.ACTION_BTNS.forEach(function(item) {
        var $btn = $('<div></div>').text(item.title)
        $btn.addClass('tp-btn btn-' + item.title.toLowerCase() + (item.btnClass ? ' ' + item.btnClass : ''))
        $actions.append($btn)
      })
      appendMobileFrame($(itemContent), buildTemplateDOMPath(blockName, templateName))
      $(itemWrapper).append($actions)
      $overviewContent.append(itemWrapper)
    }
  }
  /**
   * 项目起点
   */
  function DOMPreRender() {
    var wrapperFragment = document.createDocumentFragment()
    modules.forEach(function(gItem) {
      var seriesEl = $('<dl></dl>')
      // 构造title
      var titleLink = $('<a></a>').attr('href', '#series-' + gItem.title).text(gItem.title)
      var $titleEl = $('<dt></dt>').append(titleLink)
      // 构造子模块
      var $overviewContent = $('<dd></dd>').addClass('overview-content')
      gItem.templates.forEach(buildTemplateItmeDOM(gItem.title, $overviewContent))
      $(seriesEl).addClass('series')
        .attr('id', 'series-' + gItem.title)
        .append($titleEl)
        .append($overviewContent)
      $(wrapperFragment).append(seriesEl)
    })
    $main.append(wrapperFragment)
  }
  if (!modules) {
    startPromise = $.get('/findTemplates.php').then(function(res) {
      if (typeof res === 'string') {
        modules = JSON.parse(res)
      } else modules = res
    }).then(DOMPreRender)
  } else {
    DOMPreRender()
  }
})

// 模块复制剪贴板功能
$(function() {
  function showMsg(msg, delay) {
    delay = delay || 5000
    var $msgDom = $('<div></div>').addClass('custom-msg-alert').text(msg)
    $('body').append($msgDom)
    $msgDom.addClass('active')
    setTimeout(function() {
      $msgDom.removeClass('active')
      setTimeout(function() {
        $msgDom.remove()
      }, 500)
    }, delay)
  }
  /**
   * 拷贝指定输入元素的文本值
   * @param {jQuery} $textarea 需要复制内容的jq对象元素
   * @param {string} copyType 显示消息时候提示的类型(HTML, CSS)
   */
  function copyTextArea($textarea, copyType, needHide = true) {
    var $textVal = $textarea.show().select()
    let msgSuccess = 'Copy ' + copyType + ' successfully.'
    let msgError = 'Copy error.'
    if (document.execCommand('Copy')) {
      showMsg(msgSuccess)
    } else {
      if (navigator && navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'clipboard-write' }).then(function(result) {
          if (result.state === 'granted' || 'prompt') {
            navigator.clipboard.writeText($textVal.text())
            showMsg(msgSuccess)
          } else {
            showMsg(msgError)
          }
        })
      } else {
        showMsg(msgError)
      }
    }
    needHide && $textVal.hide()
  }
  BASEINFO.ACTION_BTNS.forEach(function(item) {
    var itemId = item.title.toLowerCase()
    $(document).on('click', '.template-item .btn-' + itemId, function() {
      copyTextArea($(this).closest('.template-item').find('.template-item_textarea-' + itemId), item.title)
    })
  })
  $main.find('.tp-btn-global-css').on('click', function() {
    copyTextArea($('#textarea-global-style'), 'Global CSS', false)
  })
})