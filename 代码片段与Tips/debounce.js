/**
 * 2020.12.10 获取某个函数的防抖函数, 借助变量GLOBALDEBOUNCE，实现同个callback函数的单例防抖函数返回
 * @author tobin.xu
 * @param {function} callback 需要进行防抖的回调函数
 * @param {number} delay 防抖的延迟
 */

function findDebounceHandler(callback, delay = 1000) {
  let storeIndexBefore = GLOBALDEBOUNCE.findIndex(item => item.callback === callback);
  if (storeIndexBefore > -1) { return GLOBALDEBOUNCE[storeIndexBefore].debounce } else {
    let debounce = (function() {
      let timeout
      return function() {
        let args = arguments
        let _this = this
        if (Promise) return new Promise(function(resolve) {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(function() {
            let result = callback.apply(_this, args);
            if ((Promise)) return resolve(result);
            else return result;
          }, delay)
        })
      }
    })();
    GLOBALDEBOUNCE.push({ callback, debounce });
    return debounce
  }
}