# 谷歌分析GA添加

## GA事件添加方法
- 在需要触发点击事件的标签上加上`class="ga-click"`
- 并添加属性`data-vars-event-category="事件类别"`
- 如果为`a`标签，则需要额外添加`data-vars-event-label="url"`,将链接地址作为该事件的事件标签进行记录，否则默认为`No Link`
- *(若需要)一些情况下手动使用js触发ga事件的时候，需要添加`data-ga-backup="事件类别"`，方便查看对应的ga事件
  - 比如内部带有`<checkbox>`的`<label>`下的事件触发(*点击`<label>`的同时会自动再触发内部的`<checkbox>`的click事件冒泡，导致触发两次GA事件*, 参考[说法](https://github.com/vuejs/vue/issues/3699))

(*采用属性`data-vars-event-category`的原因是与AMP页面的GA属性要求一致*)

## 多站点添加方法
参考`analytics.js`[Tapo官网]添加方式