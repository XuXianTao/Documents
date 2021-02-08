
/**
 * 全局浮窗管理相关回调函数
 * created 2021.02.05
 * @author tobin.xu
 * @example 
 * tp.fixedView.add({
 *  position: 'left-middle',
 *  dom: '<script src="..."></script>',
 *  priority: 10, // default 0
 *  expire: new Date('2021-5-1'),
 *  urls: [],
 *  excludeUrls: [],
 *  checkShowHandler: [],
 *  cookieName: ''
 * });
 * tp.fixedView.add({
 *  position: 'right-middle',
 *  dom: '<script src="..."></script>'
 * });
 * ...
 * tp.fixedView.show();
 */
tp.fixedView = (function() {
  var hasFixedViewShown = false; // 是否已经显示了浮窗
  // 浮窗z-index 999990, 避免遮挡dialog的999999
  var $fixedDOM = $('<div></div>').attr('id', 'tp-fixedview-container').css({
    position: 'relative',
    'z-index': 999990
  });
  /**
   * 合法的位置信息
   * key值为浮窗位置，value为当前浮窗显示时候需要对比的其他浮窗
   */ 
  var validPositionMap = {
    'left-middle': 'left-middle',
    'right-middle': 'right-middle',
    'center': 'center',
    'left-top': ['left-top', 'top'],
    'right-top': ['right-top', 'top'],
    'top': ['top', 'left-top', 'right-top'],
    'left-bottom': ['left-bottom', 'bottom'],
    'right-bottom': ['right-bottom', 'bottom'],
    'bottom': ['bottom', 'left-bottom', 'right-bottom'],
  }
  var validPositions = Object.keys(validPositionMap) // 扁平化位置信息

  var globalFixedViews = {}; // 真实浮窗信息，用于构造实际显示在页面上的内容
  var historyFixedViews = []; // 保存所有浮窗，可以查看所有add操作保存的浮窗信息
  return {
    /**
     * 添加某个浮窗到全局显示
     * @param {object} options 浮窗内容参数
     * @example options = {
     *  position: 'left-middle', // [必填]浮窗的位置
     *  dom: '<script src="..."></script>', // [必填]要显示的浮窗dom结构
     *  priority: 10, // default 0 优先级越高的会覆盖优先级低的进行显示，相同优先级后续添加的会覆盖先前添加的
     *  expire: new Date('2021-05-01'), // 过期日期
     *  urls: [], // 需要显示的页面，可以是正则或者字符串（字符串需要完全匹配），只要匹配任何一个条件即可显示
     *  excludeUrls: [], // 不需要显示的Urls数组，与checkShowHandler取交集
     *  checkShowHandler: function() {}, // 复杂的显示判断，如果要显示则返回true，否则返回false
     *  cookieName: 'uk-betterwifiboosting' // 用于判断用户是否已经关闭了该浮窗的Cookie
     * }
     */
    add: function (options) {
      options.priority = options.priority || 0;
      options.urls = options.urls || [];
      options.excludeUrls = options.excludeUrls || [];
      var position = options.position,
      priority = options.priority,
      expire = options.expire,
      cookieName = options.cookieName,
      urls = options.urls,
      excludeUrls = options.excludeUrls 
      // 使用historyFixedViews记录所有操作，方便遗留代码的删除
      historyFixedViews.push(options);
      // 判断是否存在cookieName，存在则不显示，不作处理
      if (tp.getCookie(cookieName) !== null) return;
      // 判断日期是否过期，过期不作任何处理
      if (expire && expire < new Date()) return;
      // 位置值非法，不做处理
      if (validPositions.indexOf(position) < 0) return;
      // 如果浮窗已经显示出来，则不会再显示，因此不必再进行添加
      if (hasFixedViewShown) return;
      // 检查是否符合自定义的显示判断函数
      if (options.checkShowHandler && !options.checkShowHandler()) return 
      // 判断当前页面的url路径是否符合要求
      var urlMatched = false;
      var currentURL = location.href.split('?')[0].split('#')[0]; // 移除url参数和锚点
      // 检查是否是排除的url
      for (var i = 0; i < excludeUrls.length; i++) {
        var toMatch = excludeUrls[i];
        if (toMatch instanceof RegExp && toMatch.test(currentURL)) return 1;
        if (typeof toMatch === 'string' && location.pathname === toMatch) return 2;
      }
      // 检查是否是要显示的url
      for (var i = 0; i < urls.length; i++) {
        var toMatch = urls[i];
        if (toMatch instanceof RegExp) {
          urlMatched = urlMatched || toMatch.test(currentURL);
        }
        if (typeof toMatch === 'string') {
          urlMatched = urlMatched || location.pathname === toMatch;
        }
      }
      if (urls.length === 0) urlMatched = true;
      if (!urlMatched) return ;

      var relatedPositions = validPositionMap[position];
      // 如果存在其他关联位置需要替换的时候
      if (relatedPositions instanceof Array) {
        var hasOtherHigher = false
        $.each(relatedPositions, function(index, posItem) {
          if (globalFixedViews[posItem] && globalFixedViews[posItem].priority > priority) { hasOtherHigher = true }
        })
        // 如果存在已有浮窗优先级比当前浮窗高，则不作操作
        if (hasOtherHigher) return;
        else {
          // 隐藏所有关联位置的浮窗信息
          $.each(relatedPositions, function(index, posItem) {
            delete globalFixedViews[posItem]
          })
        }
      }
      // 如果当前新增浮窗相等或高于所有关联浮窗优先级，则进行替换
      globalFixedViews[position] = globalFixedViews[position] || options;
      if (globalFixedViews[position].priority <= priority) {
        globalFixedViews[position] = options
      }
    },
    /**
     * 根据已有的globalFixedViews进行构造
     */
    show: function() { 
      // 如果没有进行过浮窗添加或者已经显示过则不作任何处理
      if (hasFixedViewShown) return;
      hasFixedViewShown = true;
      $('body').append($fixedDOM);
      for (var pos in globalFixedViews) {
        $fixedDOM.append(globalFixedViews[pos].dom);
      }
    },
    // 显示所有的add操作添加
    getHistory: function() {
      return historyFixedViews;
    },
    // 显示当前显示的浮窗信息
    getCurrent: function() {
      return globalFixedViews;
    }
  };
})();