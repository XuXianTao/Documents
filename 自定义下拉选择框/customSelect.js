/**
 * 自定义jqselect下拉框 
 * @param options {$el: 原始的selectJQ元素, selectClass新建的自定义select元素容器的Class}
 * @example
 * activeCustomSelect({
 *     '$el': $('.custom-select'),
 *     selectClass: 'custom-select', // -active 选中项 | -group | -option
 * })
 */
function activeCustomSelect(options) {
    /** 构造dom结构 */
    const selectClass = options.selectClass;
    const activeClass = selectClass + '-active';
    const dropDownClass = selectClass + '-dropdown';
    const groupClass = selectClass + '-group';
    const itemClass = selectClass + '-item';
    const extraActiveClass = options.extraActiveClass || '';
    const extraGroupClass = options.extraGroupClass || '';
    var $el = options.$el; // 原始select
    var $newSelect = $(document.createElement('div'));
    $newSelect.addClass(selectClass);
    /** 添加激活项 */
    var $activeItem = $(document.createElement('div'));
    $activeItem.append(document.createElement('input'))
    const $arrowDown = $(document.createElement('span')).addClass('arrow')
    $activeItem.append($arrowDown)
    $activeItem.addClass(activeClass + ' ' + extraActiveClass);
    $newSelect.append($activeItem);
    /** 添加选项 */
    var $optionsWrap = $(document.createElement('div'));
    $optionsWrap.addClass(groupClass + ' ' + extraGroupClass);
    $el.find('option').each(function (i) {
        var $optionItem = $(document.createElement('div'));
        $optionItem.addClass(itemClass)
            .attr('value', $(this).attr('value'))
            .attr('title', $(this).text())
            .attr('tabindex', i)
            .text($(this).text())
        $optionsWrap.append($optionItem);
    })
    var $dropDown = $(document.createElement('div'));
    $dropDown.addClass(dropDownClass);
    $dropDown.append($optionsWrap);
    $dropDown.hide();
    $newSelect.append($dropDown);
    $el.hide();
    $newSelect.insertAfter($el);

    const $optionItems = $dropDown.find('.'+itemClass)
    /** 添加交互逻辑 */
    const slideSpeed = 400
    function slideDown(cb = null) {
        $newSelect.addClass('active');
        return $dropDown.slideDown(slideSpeed, 'swing', cb);
    }
    function slideUp(cb = null) {
        $newSelect.removeClass('active');
        return $dropDown.slideUp(slideSpeed, 'swing', cb);
    }
    /** 用户输入框输入的时候，修改匹配项(左右上下键不触发) */
    const inputHandler = function() {
        slideDown();
        const inputValLower = $.trim($activeItem.find('input').val()).toLowerCase().replace(/\s+/g, ' ');
        $optionItems.each(function() {
            if ($(this).text().toLowerCase().indexOf(inputValLower) === -1) {
                $(this).addClass('hidden')
            } else {
                $(this).removeClass('hidden')
            }
        })
    };
    /** 用户按键回调 */
    const keydownHandler = function(ev) {
        function focusItem($el) {
            $optionItems.removeClass('hover')
            $el.addClass('hover').focus()
            $activeItem.find('input').focus()
        }
        var $shownItems = $optionItems.filter(function() {return !$(this).hasClass('hidden')})
        var $focusedItem = $shownItems.filter(function() {return $(this).hasClass('hover')});
        var $prevItem = $focusedItem.nextAll(':not(.hidden)').first()
        var $nextItem = $focusedItem.prevAll(':not(.hidden)').first()
        const handleOptGroup = {
            // arrowUp
            38: {
                $toFocusedItem: $nextItem,
                $defaultFocusEl: $shownItems.last()
            },
            // arrowDown
            40: {
                $toFocusedItem: $prevItem,
                $defaultFocusEl: $shownItems.first()
            },
            // enter
            13: {}
        }
        const handleOpt = handleOptGroup[ev.keyCode]
        if (handleOpt) {
            ev.preventDefault();
            if (ev.keyCode === 13) {
                // enter
                $el.val($focusedItem.attr('value')).trigger('change')
                $($activeItem).find('input').blur()
                slideUp(() => {
                    $optionItems.removeClass('hidden')
                })
                return false
            } else {
                var $toFocusedItem = handleOpt.$toFocusedItem
                var $defaultFocusEl = handleOpt.$defaultFocusEl
                if ($focusedItem.length > 0 && $toFocusedItem.length > 0) {
                    focusItem($toFocusedItem)
                } else if ($defaultFocusEl.length > 0){
                    focusItem($defaultFocusEl)
                }
            }
        }
    }
    $activeItem.find('input')
        .on('keydown', keydownHandler)
        .on('focus', slideDown)
        .on('input', inputHandler);

    /** select数值改变的时候修改自定义select的显示 */
    function changeActive() {
        $activeItem.find('input').val($el.find('option:selected').text());
        $activeItem.attr('title', $el.find('option:selected').text());
    }
    $el.on('change', changeActive);
    changeActive();

    $arrowDown.on('click', function () {
        $newSelect.toggleClass('active');
        $dropDown.slideToggle();
    })
    $(window).on('click', function (ev) {
        if ($(ev.target).closest('.' + selectClass).length === 0 && $newSelect.hasClass('active')) {
            slideUp(function() {
                changeActive()
                $optionItems.removeClass('hidden')
            });
        }
    })
    $optionsWrap.on('click', '.' + itemClass, function () {
        /** 处理点击样式逻辑 */
        slideUp() 
        /** 处理点击的表单逻辑 */
        var clickedVaule = $(this).attr('value');
        $el.val(clickedVaule).trigger('change');
    })
}