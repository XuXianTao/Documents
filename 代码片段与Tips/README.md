# Tips

- nodejs的相对路径， path模块下读取'./'时获取当前命令行调用时候所在目录；与require模块调用相对于文件目录是不一样的

- https://zhuanlan.zhihu.com/p/88449415

- gulp-insert 进行字符串操作
- IE的position absolute, 如果不设置另一边的定位，子元素的100%可能无法撑开
- element锁定滚动的方法：
  - 通过visibility: hidden的元素设置overflow:scroll（强制出现滚动条），插入width:100%子元素，父元素-子元素=滚动条宽度
  - 通过上面方法找到滚动条宽度，给body加上padding-right，避免页面重排
  - 在body加上overflow:hidden实现取消滚动
  - 另外在滚动子弹窗可以通过overscroll-behavior：contain避免滚动触底时候滚动父级
  - overscroll-behavior: none则可以完全中断滚动链

- IE 浏览器 hack：
  - 9及以下`<!--[if IE]><![endif]-->`
  - IE 10 和 11:
    `@media (-ms-high-contrast: none)`

## VSCode
- emmet配合snippers.json实现自定义板块

## GA
- google analytics, 会话数只有当用户第一次进入页面才会记录+1，1个用户数可以访问多个页面，因此可以有多个唯一身份网页浏览量
https://support.google.com/analytics/answer/2934985?hl=zh-Hans
- filters 过滤器和segment细分是不同的https://support.google.com/analytics/answer/7331978?hl=en
  - segment会在会话层面进行过滤，因此可能会返回同一会话中不符合条件的其他页面
  - 如果条件是排除语义，则一个不满足就整个会话都不符合；如果是包含予以，则会返回符合条件的同一个会话中其他页面

## GDS
- google data studio , 自定义字段会导致用户数没有自动去重（比如用户数）
- google data studio , 让自己不想要的数据隐藏，可以通过添加过滤器，让我们自定义的字段为空的去掉