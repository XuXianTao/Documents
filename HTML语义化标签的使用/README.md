HTML语义化标签
---------

语义化标签的作用主要体现在无障碍辅助功能对页面的识别以及在SEO中辅助进行重要信息的爬取。

目标是用正确的标签来显示正确的内容，对于语义化的实现，除了正确使用tag外，也可以通过添加html属性（比如`aria-labelledby`）来影响辅助技术的实现。

### `<h1>` - `<h6>`标题元素

<https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/Heading_Elements>

<https://www.w3.org/WAI/tutorials/page-structure/headings/>

-   `<h1>` 到`<h6>`的标签是在HTML的一个区块中，表示文章的标题内容，只要是标题内容，都应该通过`<hN>`来显示；
-   从1-6表示标题的层级越来越深，表示不同层级的内容标题；
-   在一个标题后续的内容都会被假定为该标题下的内容；
-   一个页面只有一个`<h1>`标签，`<h1>`与`<head>`中的`<title>`标签表示的语义内容是一致的，都用作描述网页内容的标题，但是二者的内容不一定要相同，使用同一个关键字的不同描述可能带来更好的流量效果；([参考1](https://monsido.com/difference-title-tags-h1-tags), [参考2](https://www.hobo-web.co.uk/headers/))
-   同时应该注意尽量避免跳过中间等级的标题比如没有使用`<h1>`就直接使用了`<h2>`，除非是处于[布局需要](https://www.w3.org/WAI/WCAG21/Techniques/html/H42#example-2-headings-in-a-3-column-layout)；
-   相同内容使用不同层级的head标签在SEO上没有明确规定不允许，但是这是不推荐的，因为这让内容表达的层级逻辑上变得混乱，比如：

```
<h1>关于我们</h1>
<h2>关于我们</h2>
<p>...</p>
<h2>公司发展</h2>
```

这不符合内容上的逻辑关系，h1下的内容似乎又可以都放到h2下，造成混乱。

### `<strong>/<em>`

-   `<strong>`标签在样式效果上和`<b>`一样，都是为文本添加粗体([参考](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/strong))：
    -   但是`<strong>`更加强调文本的重要性：
    -   `<b>`仅仅是样式上的调整，不强调文本重要性；
-   `<em>`标签则于`<i>`一样，为文本添加斜体，但是表达的语义逻辑上有所不同([参考](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/em#%3Ci%3E_vs._%3Cem%3E))：
    -   `<em>`标记用户需要着重阅读的内容，同时可以嵌套，嵌套越深，表示越需要着重阅读；对于斜体的部分会使用重读进行强调；
    -   `<i>`则是用来和普通文本进行区分的内容，不强调重要性；

`<strong>`与`<b>`相比，虽然目前没有明确的指标说明对于SEO有所帮助，但是也有一定帮助，因此如果是对页面SEO有所帮助的文本信息，优先使用`<strong>`；而对于`<em>`和`<i>`，则区分语义环境，如果仅仅是需要进行区分的文本则使用`<i>`，如果是需要用户着重阅读的内容则使用`<em>`。

### 结构化标签

标准的页面结构，常用的标签如下：([参考1](https://www.w3.org/WAI/tutorials/page-structure/regions/)，[参考2](https://www.w3.org/WAI/tutorials/page-structure/content/))

结构标签：(IE9+)

-   `<header>` -隔离文档，文章，部分的顶部，可能包含导航
    -   需要注意的是header不仅可以用于body下，也可以用于article, section下
-   `<footer>`-隔离文档，文章，部分的底部，包含元信息
    -   与header一样，也可以用在article, section下
-   `<nav>`-隔离导航菜单，导航元素组([参考](https://www.w3.org/WAI/WCAG21/Techniques/html/H97.html))
    -   单个网页内可以有多个导航，考虑到标题内容应该是用于传达`页面上内容的组织`(构建页面的层级目录)，因此如果要在nav中使用h1-h6标签，应该有一个层级较高的标题，比如Navigation Menu，如下：\
        ![](https://www.w3.org/WAI/tutorials/img/page-structure-headings-1b48a3e1.png)
-   `<main>` - 标识网页的主要区域内容，是独一无二的
-   `<aside>` - 识别支持主要内容的区域，比如解释或注释主要内容的旁注

内容标签：(IE9+)

-   `<article>` -代表网页中完整或独立的组成（[可独立分配的或可复用的结构](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/article)），[不仅仅用于文章，也可以用于其他独立的事物](https://www.smashingmagazine.com/2020/01/html5-article-section/#conclusion)
-   `<section>` -标记网页或文章的常规区域，一般用作某个主题下的分组
-   总结：
    -   以上二者可以根据语义进行相互嵌套
    -   对于页面的语义结构，更优先会考虑h1-h6的出现顺序，因此在`<article>`或者`<section>`下，都需要根据已有标题设置正确层级的标题标签

常见页面布局如下：

![This image has an empty alt attribute; its file name is screen-12.png](https://www.socialmediatoday.com/user_media/ckeditor/linkassistant/2020/03/25/screen-12.png)

https://www.socialmediatoday.com/news/8-of-the-most-important-html-tags-for-seo/574987/

需要注意，所有的语义化标签都是出于内容的考虑而使用，不能为了使用某个标签的样式而蓄意使用，这会导致语义的混乱。

检查页面的语义框架结构，可以使用[在线验证器](https://validator.w3.org/), 需要注意勾选`show outline`，对于结果，可以滑倒最底部查看。

关键词汇
----

Web Content Accessibility Guidelines (WCAG)  Web内容可访问性指南

参考文献
----

-  `<h1>-<h6>`标签的使用：<https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/Heading_Elements>
-   Page Regions：<https://www.w3.org/WAI/tutorials/page-structure/regions/>
-   成功准则（在不同设备的不同演示形式下，正确保留页面的信息关系）：<https://www.w3.org/TR/UNDERSTANDING-WCAG20/content-structure-separation-programmatic.html>
-   语义快速自查：<https://www.w3.org/WAI/WCAG21/quickref/>
-   HTML Headings Elements: How Many H1 & H2 Tags Per Page?：<https://www.hobo-web.co.uk/headers/>