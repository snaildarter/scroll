
/*!
 * JavaScript Scroll v0.0.1
 *
 * Released under the MIT license
 */
;(function (factory) {
    var registeredInModuleLoader = false;
    if (typeof define === 'function' && define.amd) {
        define(factory);
        registeredInModuleLoader = true;
    }
    if (typeof exports === 'object') {
        module.exports = factory();
        registeredInModuleLoader = true;
    }
    if (!registeredInModuleLoader) {
        var OldCookies = window.Cookies;
        var api = window.Cookies = factory();
        api.noConflict = function () {
            window.Cookies = OldCookies;
            return api;
        };
    }
}(function (){
    "use strict";

    var w = window,
        d = document,
        u = undefined;
    function nwScroll(inDoms, inParams) {
        var apis = [];
        function initScroll(inDom) {
            // 参数核心

            //外部控制参数
            var params = {
                yShow: true,
                xShow: false,
                btnsShow: true,
                autoHide: false,
                wheelRatio: 8,
                btnsRatio: 4,
                cnHeight: "100%",
                cnWidth: "100%"
            };

            //合并外部控制参数
            for (var key in inParams) {
                params[key] = inParams[key];
            }

            //内部控制参数
            var doms = u, animate_ctl = false, drag_ctl = false, btns_timer = u,
                hide_timer = u, bar_site = 0, m_site = 0, old_site = 0, axis_dir = "";

            /*
            **API核心
            */

            apis.push({
                refresh: function () {
                    autoShow(), dynamicSize();
                },
                selfDoms: function () {
                    return doms;
                },
                toMax: function (axis) {
                    rollToEdge(axis, 1);
                },
                toMin: function (axis) {
                    rollToEdge(axis, -1);
                }
            });

            /*
            **View核心
            */

            //View主体框架
            function initView() {
                //用于全局实例唯一标识
                w.scSign = (w.scSign || 0) + 1;

                //定义所有div
                doms = { sc_cn: u, sc_m: u };
                var yDoms = { sc_r: u, sc_r_bl: u, sc_r_c: u, sc_r_c_bar: u },
                    xDoms = { sc_b: u, sc_b_bl: u, sc_b_c: u, sc_b_c_bar: u };

                //增加按钮
                params.btnsShow && (yDoms.sc_r_t = u, yDoms.sc_r_b = u, xDoms.sc_b_l = u, xDoms.sc_b_r = u);

                //按需导入div
                if (params.yShow) {
                    for (var key in yDoms) {
                        doms[key] = yDoms[key];
                    }
                }
                if (params.xShow) {
                    for (key in xDoms) {
                        doms[key] = xDoms[key];
                    }
                }

                //生成所有div,并为所有div增加class和标识
                for (key in doms) {
                    doms[key] = d.createElement("div");
                    doms[key].className = key;
                }

                //设置容器特定的class和属性
                doms.sc_cn.className = "sc_cn " + "nwScroll_" + w.scSign, w.addEventListener ? doms.sc_cn.setAttribute("tabIndex", w.scSign) : doms.sc_cn.tabIndex = w.scSign;

                //设置容器宽高
                doms.sc_cn.style.height = params.cnHeight, doms.sc_cn.style.width = params.cnWidth;

                //组建容器
                doms.sc_cn.appendChild(doms.sc_m);
                params.yShow && (doms.sc_cn.appendChild(doms.sc_r), doms.sc_r.appendChild(doms.sc_r_bl), params.btnsShow && (doms.sc_r.appendChild(doms.sc_r_t), doms.sc_r.appendChild(doms.sc_r_b)), doms.sc_r.appendChild(doms.sc_r_c),
                    doms.sc_r_c.appendChild(doms.sc_r_c_bar));
                params.xShow && (doms.sc_cn.appendChild(doms.sc_b), doms.sc_b.appendChild(doms.sc_b_bl), params.btnsShow && (doms.sc_b.appendChild(doms.sc_b_l), doms.sc_b.appendChild(doms.sc_b_r)), doms.sc_b.appendChild(doms.sc_b_c),
                    doms.sc_b_c.appendChild(doms.sc_b_c_bar));
                inDom.parentNode.insertBefore(doms.sc_cn, inDom);
                doms.sc_m.appendChild(inDom);

                //设置计算性参数
                dynamicSize();

                //按需定制界面
                params.btnsShow && (
                    params.yShow && (doms.sc_r_t.innerHTML = "▴", doms.sc_r_b.innerHTML = "▾"),
                    params.xShow && (doms.sc_b_l.innerHTML = "◂", doms.sc_b_r.innerHTML = "▸")
                );

                //显示控制
                params.autoHide && (doms.sc_r && (doms.sc_r.style.visibility = "hidden"), doms.sc_b && (doms.sc_b.style.visibility = "hidden"));
                autoShow();
            }

            //计算性参数
            function dynamicSize() {
                params.yShow && (
                    doms.sc_r_bl.style.height = doms.sc_r_c.style.height = doms.sc_r.clientHeight - 2 * (params.btnsShow ? doms.sc_r_t.clientHeight : 0) + "px",
                    doms.sc_r_bl.style.top = doms.sc_r_c.style.top = (params.btnsShow ? doms.sc_r_t.clientHeight : 0) + "px",
                    doms.sc_r_c_bar.style.height = doms.sc_cn.clientHeight / doms.sc_m.clientHeight * doms.sc_r_c.clientHeight + "px",
                    doms.sc_r.clientWidth && parseFloat(doms.sc_r_c_bar.style.top) && (resetSite({ clientName: "clientHeight", aim: "top", cName: "sc_r_c", barName: "sc_r_c_bar" }))
                );
                params.xShow && (
                    // doms.sc_b.style.left = doms.sc_r && !!doms.sc_r.clientWidth ? doms.sc_r.clientWidth + "px" : "3%",
                    // doms.sc_b.style.width = doms.sc_r && !!doms.sc_r.clientWidth ? doms.sc_cn.clientWidth - 2 * doms.sc_r.clientWidth + "px" : "94%",
                    doms.sc_b_bl.style.width = doms.sc_b_c.style.width = doms.sc_b.clientWidth - 2 * (params.btnsShow ? doms.sc_b_l.clientWidth : 0) + "px",
                    doms.sc_b_bl.style.left = doms.sc_b_c.style.left = (params.btnsShow ? doms.sc_b_l.clientWidth : 0) + "px",
                    doms.sc_b_c_bar.style.width = parseInt(doms.sc_cn.clientWidth / doms.sc_m.clientWidth * doms.sc_b_c.clientWidth) + "px",
                    doms.sc_b.clientWidth && parseFloat(doms.sc_b_c_bar.style.left) && (resetSite({ clientName: "clientWidth", aim: "left", cName: "sc_b_c", barName: "sc_b_c_bar" }))
                );
            }

            //位置重置
            function resetSite(obj) {
                var _maxSite = -(doms.sc_m[obj.clientName] - doms.sc_cn[obj.clientName]),
                    toSite = 0, _toSite = parseFloat(doms.sc_m.style[obj.aim]);

                _toSite < _maxSite && (_toSite = _maxSite);
                toSite = -_toSite / doms.sc_m[obj.clientName] * doms[obj.cName][obj.clientName];
                doms.sc_m.style[obj.aim] = _toSite + "px";
                doms[obj.barName].style[obj.aim] = toSite + "px";
            }

            //自动隐藏滚动条
            function autoShow() {
                params.yShow && (doms.sc_cn.clientHeight / doms.sc_m.clientHeight >= 1 && (doms.sc_r.style.display = "none", doms.sc_m.style.top = "0px") || (doms.sc_r.style.display = ""));
                params.xShow && (doms.sc_cn.clientWidth / doms.sc_m.clientWidth >= 1 && (doms.sc_b.style.display = "none", doms.sc_m.style.left = "0px") || (doms.sc_b.style.display = ""));
            }

            /*
            **滚动核心
            */

            //滚动前准备
            function beforeRoll(barName, aim) {
                bar_site = parseFloat(doms[barName].style[aim]) || 0;
                m_site = parseFloat(doms.sc_m.style[aim]) || 0;
            }

            //基本滚动,需准备
            function roll(axis, gap) {
                var maxSite = 0, _maxSite = 0, toSite = 0, _toSite = 0,
                    cName = "sc_r_c", barName = "sc_r_c_bar", aim = "top", clientName = "clientHeight";
                axis == "x" && (cName = "sc_b_c", barName = "sc_b_c_bar", aim = "left", clientName = "clientWidth");

                maxSite = doms[cName][clientName] - doms[barName][clientName];
                _maxSite = -(doms.sc_m[clientName] - doms.sc_cn[clientName]);

                toSite = bar_site + gap;
                _toSite = m_site + gap / maxSite * _maxSite;

                toSite < 0 && (toSite = _toSite = 0);
                toSite > maxSite && (toSite = maxSite, _toSite = _maxSite);

                doms[barName].style[aim] = toSite + "px";
                doms.sc_m.style[aim] = _toSite + "px";
            }

            //长距离动画滚动,需准备
            function animateRoll(axis, gap) {
                animate_ctl = true;
                var roll_ceil = gap / 30, _gap = 0;
                var timer = setInterval(function () {
                    _gap += roll_ceil;
                    Math.abs(_gap) >= Math.abs(gap) && (_gap = gap);
                    roll(axis, _gap);
                    _gap == gap && !clearInterval(timer) && (animate_ctl = false);
                }, 10);
            }

            //滚动到边界
            function rollToEdge(axis, axis_dir) {
                var obj = axis == "y" ? { edge: doms.sc_r_c.clientHeight * axis_dir, barName: "sc_r_c_bar", aim: "top" } :
                    { edge: doms.sc_b_c.clientWidth * axis_dir, barName: "sc_b_c_bar", aim: "left" };
                obj.edge && (beforeRoll(obj.barName, obj.aim), animateRoll(axis, obj.edge));
            }

            /*
            **事件核心
            */

            //事件主体框架
            function initEvent() {
                //事件句柄
                var eventCreator = d.addEventListener ? "addEventListener" : "attachEvent", prefix = d.addEventListener ? "" : "on",
                    eventWheel = navigator.userAgent.indexOf("Firefox") != -1 ? "DOMMouseScroll" : "mousewheel";

                //复用代码
                var optimiseCode0 = "e = e || w.event;e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;";
                //var optimiseCode1 = "e = e || w.event; e.preventDefault ? e.preventDefault() : e.returnValue = false;";
                var optimiseCode1 = "e = e || w.event;var src = e.target || e.srcElement; if(src.tagName != 'SELECT' && src.tagName != 'INPUT' && src.tagName != 'TEXTAREA'){e.preventDefault ? e.preventDefault() : e.returnValue = false;}";
                
                //纵向事件
                if (doms.sc_r) {
                    doms.sc_r_c_bar[eventCreator](prefix + "mousedown", function (e) {
                        barsMouseDown(e, { axis: "y", aim: "top", axisVal: "clientY", barName: "sc_r_c_bar" });
                    });

                    doms.sc_r_c_bar[eventCreator](prefix + "mouseup", function (e) {
                        eval(optimiseCode0);  //return不能代入 return只能存在函数域内部  严格模式eval有自己的域
                        if (getEBtn(e) != 0) { return }
                        drag_ctl = false;
                    });

                    doms.sc_r_c[eventCreator](prefix + "mousedown", function (e) {
                        cMouseDown(e, { axis: "y", barName: "sc_r_c_bar", aim: "top", clientName: "clientHeight", axisVal: "clientY" });
                    });

                    if (params.btnsShow) {
                        doms.sc_r_t[eventCreator](prefix + "mousedown", function (e) {
                            eval(optimiseCode0);
                            if (getEBtn(e) != 0) { return }
                            btnsMouseDown({ axis: "y", cName: "sc_r_c", barName: "sc_r_c_bar", aim: "top", clientName: "clientHeight" });
                        });

                        doms.sc_r_t[eventCreator](prefix + "mouseup", function (e) {
                            e = e || w.event;
                            if (getEBtn(e) != 0) { return }
                            clearInterval(btns_timer);
                            btns_timer = u;
                        });

                        doms.sc_r_t[eventCreator](prefix + "mouseleave", function () {
                            btnsMouseLeave();
                        });

                        doms.sc_r_b[eventCreator](prefix + "mousedown", function (e) {
                            eval(optimiseCode0);
                            if (getEBtn(e) != 0) { return }
                            btnsMouseDown({ axis: "y", cName: "sc_r_c", barName: "sc_r_c_bar", aim: "top", clientName: "clientHeight", is_br: 1 });
                        });

                        doms.sc_r_b[eventCreator](prefix + "mouseup", function (e) {
                            e = e || w.event;
                            if (getEBtn(e) != 0) { return }
                            clearInterval(btns_timer);
                            btns_timer = u;
                        });

                        doms.sc_r_b[eventCreator](prefix + "mouseleave", function () {
                            btnsMouseLeave();
                        });
                    }

                    doms.sc_r[eventCreator](prefix + "contextmenu", function () {
                        eval(optimiseCode1);
                    });

                }

                //横向事件
                if (doms.sc_b) {
                    doms.sc_b_c_bar[eventCreator](prefix + "mousedown", function (e) {
                        barsMouseDown(e, { axis: "x", aim: "left", axisVal: "clientX", barName: "sc_b_c_bar" });
                    });

                    doms.sc_b_c_bar[eventCreator](prefix + "mouseup", function (e) {
                        eval(optimiseCode0);
                        if (getEBtn(e) != 0) { return }
                        drag_ctl = false;
                    });

                    doms.sc_b_c[eventCreator](prefix + "mousedown", function (e) {
                        cMouseDown(e, { axis: "x", barName: "sc_b_c_bar", aim: "left", clientName: "clientWidth", axisVal: "clientX" });
                    });

                    if (params.btnsShow) {
                        doms.sc_b_l[eventCreator](prefix + "mousedown", function (e) {
                            eval(optimiseCode0);
                            if (getEBtn(e) != 0) { return }
                            btnsMouseDown({ axis: "x", cName: "sc_b_c", barName: "sc_b_c_bar", aim: "left", clientName: "clientWidth" });
                        });

                        doms.sc_b_l[eventCreator](prefix + "mouseup", function (e) {
                            e = e || w.event;
                            if (getEBtn(e) != 0) { return }
                            clearInterval(btns_timer);
                            btns_timer = u;
                        });

                        doms.sc_b_l[eventCreator](prefix + "mouseleave", function () {
                            btnsMouseLeave();
                        });

                        doms.sc_b_r[eventCreator](prefix + "mousedown", function (e) {
                            eval(optimiseCode0);
                            if (getEBtn(e) != 0) { return }
                            btnsMouseDown({ axis: "x", cName: "sc_b_c", barName: "sc_b_c_bar", aim: "left", clientName: "clientWidth", is_br: 1 });
                        });

                        doms.sc_b_r[eventCreator](prefix + "mouseup", function (e) {
                            e = e || w.event;
                            if (getEBtn(e) != 0) { return }
                            clearInterval(btns_timer);
                            btns_timer = u;
                        });

                        doms.sc_b_r[eventCreator](prefix + "mouseleave", function () {
                            btnsMouseLeave();
                        });
                    }

                    doms.sc_b[eventCreator](prefix + "contextmenu", function () {
                        eval(optimiseCode1);
                    });
                }

                //全局事件
                doms.sc_cn[eventCreator](prefix + "keydown", function (e) {
                    eval(optimiseCode1);
                    var obj = { axis: "y", cName: "sc_r_c", barName: "sc_r_c_bar", aim: "top", clientName: "clientHeight", is_br: 1 },
                        _obj = { axis: "x", cName: "sc_b_c", barName: "sc_b_c_bar", aim: "left", clientName: "clientWidth", is_br: 1 };

                    switch (e.keyCode) {
                        case 32:
                            params.yShow && btnsMouseDown(obj);
                            break;
                        case 37:
                            params.xShow && (_obj.is_br = 0, btnsMouseDown(_obj));
                            break;
                        case 38:
                            params.yShow && (obj.is_br = 0, btnsMouseDown(obj));
                            break;
                        case 39:
                            params.xShow && btnsMouseDown(_obj);
                            break;
                        case 40:
                            params.yShow && btnsMouseDown(obj);
                            break;
                    }
                });

                doms.sc_cn[eventCreator](prefix + "keyup", function () {
                    clearInterval(btns_timer), btns_timer = u;
                });

                doms.sc_cn[eventCreator](prefix + "mouseenter", function () {
                    doms.sc_cn.focus();

                    if (params.autoHide) {
                        if (hide_timer != u) {
                            clearInterval(hide_timer), hide_timer = u;
                            return
                        }
                        params.yShow && (doms.sc_r.style.visibility = "visible");
                        params.xShow && (doms.sc_b.style.visibility = "visible");
                    }
                });
                doms.sc_cn[eventCreator](prefix + "mouseleave", function () {
                    doms.sc_cn.blur();
                    btns_timer && (clearInterval(btns_timer), btns_timer = u);

                    params.autoHide && (hide_timer = setInterval(function () {
                        if (!drag_ctl && !animate_ctl) {
                            params.yShow && (doms.sc_r.style.visibility = "hidden");
                            params.xShow && (doms.sc_b.style.visibility = "hidden");
                            clearInterval(hide_timer);
                            hide_timer = u;
                        }
                    }, 10));
                });

                doms.sc_cn[eventCreator](prefix + eventWheel, function (e) {
                    eval(optimiseCode1);
                    if (animate_ctl || drag_ctl || btns_timer != u) { return }

                    var ratio = 0;
                    e.wheelDelta ? ratio = -e.wheelDelta / 120 : ratio = e.detail / 3;

                    if (params.yShow && doms.sc_r.style.display != "none") {
                        cnMouseWheel({
                            ratio: ratio, cnName: "sc_r", barName: "sc_r_c_bar", clientName: "clientHeight", aim: "top", axis: "y", cName: "sc_r_c"
                        });
                    }
                    else if (params.xShow && doms.sc_b.style.display != "none") {
                        cnMouseWheel({
                            ratio: ratio, cnName: "sc_b", barName: "sc_b_c_bar", clientName: "clientWidth", aim: "left", axis: "x", cName: "sc_b_c"
                        });
                    }
                });

                d[eventCreator](prefix + "mousemove", function (e) {
                    if (drag_ctl) {
                        eval(optimiseCode1);
                        if (getEBtn(e) != 0) { return }

                        var new_site = axis_dir == "y" ? e.clientY : e.clientX;
                        roll(axis_dir, new_site - old_site);
                    }
                });

                d[eventCreator](prefix + "mouseup", function (e) {
                    e = e || w.event;
                    getEBtn(e) == 0 && (drag_ctl = false, btns_timer && (clearInterval(btns_timer), btns_timer = u));
                });
            }

            //主体框滚轮事件实现
            function cnMouseWheel(obj) {
                if ((obj.ratio < 0 && !parseFloat(doms[obj.barName].style[obj.aim])) ||
                    (obj.ratio > 0 && (doms[obj.cName][obj.clientName] - doms[obj.barName][obj.clientName]) == (parseFloat(doms[obj.barName].style[obj.aim]) || 0))) {
                    return
                }
                var gap = obj.ratio * (doms[obj.cnName][obj.clientName] - doms[obj.barName][obj.clientName]) * params.wheelRatio / 50;
                beforeRoll(obj.barName, obj.aim);
                animateRoll(obj.axis, gap);
            }

            //上下左右按钮mousedown事件实现
            function btnsMouseDown(obj) {
                var edge = obj.is_br ? doms[obj.cName][obj.clientName] - doms[obj.barName][obj.clientName] : 0,
                    origin = parseFloat(doms[obj.barName].style[obj.aim]) || 0;

                if (animate_ctl || origin == edge || btns_timer != u || drag_ctl) { return }
                var maxGap = (doms[obj.cName][obj.clientName] - doms[obj.barName][obj.clientName]) * (obj.is_br ? 1 : -1),
                    roll_ceil = maxGap * params.btnsRatio / 400, _gap = 0;

                beforeRoll(obj.barName, obj.aim);
                btns_timer = setInterval(function () {
                    _gap += roll_ceil;
                    ((_gap > 0 && _gap > maxGap) || (_gap < 0 && _gap < maxGap)) && (_gap = maxGap);
                    roll(obj.axis, _gap);
                    _gap == maxGap && (clearInterval(btns_timer), btns_timer = u);
                }, 10);
            }

            //上下左右按钮mouseleave事件实现
            function btnsMouseLeave() {
                btns_timer != u && (clearInterval(btns_timer), btns_timer = u);
            }

            //滑块mousedown事件实现
            function barsMouseDown(e, obj) {
                e = e || w.event;
                var src = e.target || e.srcElement;
                e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
                if (src.tagName != 'SELECT' && src.tagName != 'INPUT' && src.tagName != 'TEXTAREA')
                    e.preventDefault ? e.preventDefault() : e.returnValue = false;
                if (getEBtn(e) != 0 || animate_ctl) { return }

                drag_ctl = true;
                axis_dir = obj.axis;
                old_site = e[obj.axisVal];

                //调用roll()前的准备
                beforeRoll(obj.barName, obj.aim);
            }

            //滑块容器mousedown事件实现
            function cMouseDown(e, obj) {
                e = e || w.event;
                var src = e.target || e.srcElement;
                e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;

                if (getEBtn(e) != 0 || animate_ctl) { return }

                //调用animateRoll()前的准备
                beforeRoll(obj.barName, obj.aim);

                var _gap = e[obj.axisVal] - src.getBoundingClientRect()[obj.aim] - parseFloat(doms[obj.barName].style[obj.aim] || 0);
                _gap > 0 && (_gap = _gap - doms[obj.barName][obj.clientName]);
                animateRoll(obj.axis, _gap);
            }

            //获取鼠标点击按钮
            function getEBtn(e) {
                var ua = w.navigator.userAgent.toLowerCase(), ie_btn = u;
                ua.indexOf("msie") != -1 && (ua.match(/msie\s\d+/)[0].match(/\d+/)[0] || ua.match(/trident\s?\d+/)[0]) < 9 && (ie_btn = { 1: 0, 2: 2, 4: 1 }[e.button]);
                return ie_btn == u ? e.button : ie_btn;
            }

            /*
            **初始化
            */

            //初始化视图
            initView();

            //初始化事件
            initEvent();
        }

        if (inDoms.length === u) {
            initScroll(inDoms);
            return apis[0];
        }else {
            for (var i = 0; i < inDoms.length; i++) {
                initScroll(inDoms[i]);
            }
            return apis;
        }
    }
    w.nw = w.nw || {}, w.nw.scroll = nwScroll;
    return nwScroll;
});
