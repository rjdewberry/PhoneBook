///#source 1 1 /Scripts/MetroJs/src/js/init.js
/*!
* Metro JS for jQuery
* http://drewgreenwell.com/ 
* For details and usage info see: http://drewgreenwell.com/projects/metrojs

Copyright (C) 2012, Drew Greenwell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
;(function ($) {
    // the metrojs object contains helper methods and theme settings
    $.fn.metrojs = {
        capabilities: null,
        checkCapabilities: function(stgs, recheck){
            if($.fn.metrojs.capabilities == null || (typeof(recheck) != "undefined" && recheck == true))
                $.fn.metrojs.capabilities = new $.fn.metrojs.MetroModernizr(stgs);
            return  $.fn.metrojs.capabilities;
        }
    };
    var metrojs = $.fn.metrojs;
///#source 1 1 /Scripts/MetroJs/src/js/liveTile.js
var MAX_LOOP_COUNT = 99000;
// .liveTile
$.fn.liveTile = function (method) {
    if (pubMethods[method]) {
        var args = [];
        for (var i = 1; i <= arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
        return pubMethods[method].apply(this, args);
    } else if (typeof method === 'object' || !method) {
        return pubMethods.init.apply(this, arguments);
    } else {
        $.error('Method ' + method + ' does not exist on jQuery.liveTile');
        return null;
    }
};


$.fn.liveTile.contentModules = {
    modules: {},
    /* the default module layout
    {
        image: defaultModules.imageSwap,
        html: defaultModules.htmlSwap
    },*/
    addContentModule: function (moduleName, module) {
        if (typeof (this.modules) !== "object")
            this.modules = {};
        this.modules[moduleName] = module;
    },
    hasContentModule: function(moduleName){
        if (typeof (moduleName) === "undefined" || typeof (this.modules) !== "object")
            return false;
        return (typeof (this.modules[moduleName]) !== "undefined");
    }
};

// default option values for .liveTile
$.fn.liveTile.defaults = {
    mode: 'slide',                          // 'slide', 'flip', 'flip-list', carousel
    speed: 500,                             // how fast should animations be performed, in milliseconds
    initDelay: -1,                          // how long to wait before the initial animation
    delay: 5000,                            // how long to wait between animations 
    stops: "100%",                          // how much of the back tile should 'slide' reveal before starting a delay
    stack: false,                           // should tiles in slide mode appear stacked (e.g Me tile) 
    direction: 'vertical',                  // which direction should animations be performed(horizontal | vertical)
    animationDirection: 'forward',          // the direction that carousel mode uses to determine which way to slide in tiles
    tileSelector: '>div,>li,>p,>img,>a',    // the selector used by carousel mode and flip-list to choose tile containers
    tileFaceSelector: '>div,>li,>p,>img,>a',// the selector used to choose the front and back containers
    ignoreDataAttributes: false,            // should data attributes be ignored
    click: null,                            // function ($tile, tdata) { return true; }
    link: '',                               // a url to go to when clicked
    newWindow: false,                       // should the link be opened in a new window
    bounce: false,                          // should the tile shrink when tapped
    pauseOnHover: false,                    // should tile animations be paused on hover in and restarted on hover out
    playOnHover: false,                     // should "play" be called on hover
    onHoverDelay: 0,                        // the amount of time to wait before the onHover event is fired
    repeatCount: -1,                        // number of times to repeat the animation        
    appendBack: true,                       // appends the .last tile if one doesnt exist (slide and flip only)        
    alwaysTrigger: false,                   // should every item in a flip list trigger every time a delay passes 
    flipListOnHover: false,                 // should items in flip-list flip and stop when hovered
    flipListOnHoverEvent: 'mouseout',       // which event should be used to trigger the flip-list faces
    noHAflipOpacity: '1',                   // the opacity level set for the backside of the flip animation on unaccelerated browsers
    haTransFunc: 'ease',                    // the tranisiton-timing function to use in hardware accelerated mode
    noHaTransFunc: 'linear',                // the tranisiton-timing function to use in non hardware accelerated mode
    currentIndex: 0,                        // what is the current stop index for slide mode or slide index for carousel mode
    startNow: true,                         // should the tile immediately start or wait util play or restart has been called
    useModernizr: (typeof (window.Modernizr) !== "undefined"), // checks to see if modernizer is already in use
    useHardwareAccel: true,                 // should css animations, transitions and transforms be used when available
    faces: {
        $front: null,                        // the jQuery element to use as the front face of the tile; this will bypass tileCssSelector
        $back: null                          // the jQuery element to use as the back face of the tile; this will bypass tileCssSelector
    },
    animationComplete: function (tileData, $front, $back) {
    },
    triggerDelay: function (idx) {          // used by flip-list to decide how random the tile flipping should be
        return Math.random() * 3000;
    },
    swap: '',                               // which swap modules are active for this tile (image, html) 
    swapFront: '-',                         // override the available swap modules for the front face
    swapBack: '-',                          // override the available swap modules for the back face
    contentModules: []
};
// public methods that can be called via .liveTile(method name)
var pubMethods = {
    init: function (options) {
        // Setup the public options for the livetile
        var stgs = {};
        $.extend(stgs, $.fn.liveTile.defaults, options);
        // checks for browser feature support to enable hardware acceleration                        
        metrojs.checkCapabilities(stgs);        
        // setup the default content modules
        if (!$.fn.liveTile.contentModules.hasContentModule("image"))
            $.fn.liveTile.contentModules.addContentModule("image", defaultModules.imageSwap);
        if (!$.fn.liveTile.contentModules.hasContentModule("html"))
            $.fn.liveTile.contentModules.addContentModule("html", defaultModules.htmlSwap);
        // this is where the magic happens
        return $(this).each(function (tileIndex, ele) {
            var $this = $(ele),
                data = privMethods.initTileData($this, stgs);
            // append back tiles and add appropriate classes to prepare tiles
            data.faces = privMethods.prepTile($this, data);
            // action methods
            data.slide = function (count) { privMethods.slide($this, count); };
            data.carousel = function (count) { privMethods.carousel($this, count); };
            data.flip = function (count) { privMethods.flip($this, count); };
            data.flipList = function (count) { privMethods.flipList($this, count); };

            data.doAction = function (count) {
                var actions = {
                    slide: data.slide,
                    carousel: data.carousel,
                    flip: data.flip,
                    'flip-list': data.flipList
                },
                // get the action for the current mode
                action = actions[data.mode];
                if (typeof (action) === "function") {
                    data.loopCount = count;
                    action(count);
                    data.hasRun = true;
                }
                // prevent pauseOnHover from resuming a tile that has finished
                if (count == data.timer.repeatCount)
                    data.runEvents = false;
            };
            
            // create a new tile timer
            data.timer = new $.fn.metrojs.TileTimer(data.delay, data.doAction, data.repeatCount);
            // apply the data
            $this.data("LiveTile", data);
            // handle events
            // only bind pause / play on hover if we are not using a fliplist or flipListOnHover isn't set set
            if (data.mode !== "flip-list" || data.flipListOnHover == false) {
                if (data.pauseOnHover) {
                    privMethods.bindPauseOnHover($this);
                } else if (data.playOnHover) {
                    privMethods.bindPlayOnHover($this);
                }
            }
            // add a click / link to the tile
            if (data.link.length > 0 || typeof(data.click) === "function") {
                $this.css({ cursor: 'pointer' }).bind("click.liveTile", function () {
                    var proceed = true;
                    if (typeof (data.click) === "function") {
                        proceed = data.click($this, data) || false;
                    }
                    if (proceed && data.link.length > 0) {
                        if (data.newWindow)
                            window.open(data.link);
                        else
                            window.location = data.link;
                    }
                });
            }
            // add bounce if set
            if (data.useHardwareAccel && metrojs.capabilities.canTransition)
                privMethods.bindBounce($this, data);            
            // start timer
            if (data.startNow && data.mode != "none") {
                data.runEvents = true;
                data.timer.start(data.initDelay);
            }
        });
    },
    // goto is a future reserved word
    'goto': function (options) {
        var opts, t = typeof (options);
        if(t === "undefined"){
            opts = {
                index: -99, //  same as next
                delay: 0,
                autoAniDirection: false
            };
        }if (t === "number" || !isNaN(options)) {
            opts = {
                index: parseInt(options, 10),
                delay: 0
            };
        } else if(t === "string"){
            if (options == "next") {
                opts = {
                    index: -99,
                    delay: 0
                }                
            } else if (options.indexOf("prev") === 0) {
                opts = {
                    index: -100,
                    delay: 0
                }                
            } else {
                $.error(options + " is not a recognized action for .liveTile(\"goto\")");
                return;
            }
        }else if (t === "object") {
            if (typeof (options.delay) === "undefined") {
                options.delay = 0;
            }
            var ti = typeof (options.index);
            if (ti === "undefined") {
                options.index = 0;
            } else if (ti === "string") {
                if (options.index === "next")
                    options.index = -99;
                else if (options.index.indexOf("prev") === 0)
                    options.index = -100;
            }
            opts = options;
        }       
        return $(this).each(function (tileIndex, ele) {
            var $tile = $(ele),
                data = $tile.data("LiveTile"),
                aniData = $tile.data("metrojs.tile"),
                goTo = opts.index;
            if (aniData.animating === true)
                return;
            if (data.mode === "carousel") {
                // get the index based off of the active carousel slide
                var $cur = data.faces.$listTiles.filter(".active");
                var curIdx = data.faces.$listTiles.index($cur);
                // carousel will look for these values as triggers
                if (goTo === -100) { // prev
                    // autoAniDirection determines if a forward or backward animation should be used based on the goTo index
                    if(typeof(opts.autoAniDirection) === "undefined" || opts.autoAniDirection)
                        data.tempValues.animationDirection = typeof(opts.animationDirection) === "undefined" ? "backward" : opts.animationDirection;
                    goTo = curIdx === 0 ? data.faces.$listTiles.length -1 : curIdx - 1;
                } else if (goTo === -99) { // next
                    if (typeof (opts.autoAniDirection) === "undefined" || opts.autoAniDirection)
                        data.tempValues.animationDirection = typeof (opts.animationDirection) === "undefined" ? "forward" : opts.animationDirection;
                    goTo = curIdx + 1;
                }
                if (curIdx == goTo) {
                    return;
                }
                if (typeof (opts.direction) !== "undefined") {
                    data.tempValues.direction = opts.direction;
                }
                if (typeof (opts.animationDirection) !== "undefined") {
                    data.tempValues.animationDirection = opts.animationDirection;
                }
                // the index is offset by 1 and incremented on animate
                if (goTo == 0)
                    data.currentIndex = data.faces.$listTiles.length;
                else
                    data.currentIndex = goTo - 1;
            } else // slide mode will use the index directly
                data.currentIndex = goTo;
            // start the timer
            data.runEvents = true;
            data.timer.start(opts.delay >= 0 ? opts.delay : data.delay);
        });  
    },
    play: function (options) {
        var opts, t = typeof (options);
        if (t === "undefined") {
            opts = {
                delay: -1
            };
        } else if (t === "number") {
            opts = {
                delay: options
            };
        } else if (t === "object") {
            if(typeof(options.delay) === "undefined"){
                options.delay = -1;                
            }
            opts = options;
        }
        return $(this).each(function (tileIndex, ele) {
            var $tile = $(ele),
                data = $tile.data("LiveTile");
            data.runEvents = true;
            if (opts.delay < 0 && !data.hasRun)
                opts.delay = data.initDelay;            
            data.timer.start(opts.delay >= 0 ? opts.delay : data.delay);
        });
    },
    animate: function () { // this is really only useful for slide mode
        return $(this).each(function (tileIndex, ele) {
            var $tile = $(ele),
                data = $tile.data("LiveTile");
            data.doAction();
        });
    },
    stop: function () {
        return $(this).each(function (tileIndex, ele) {
            var $tile = $(ele),
                data = $tile.data("LiveTile");
            data.hasRun = false;
            data.runEvents = false;
            data.timer.stop();
            window.clearTimeout(data.eventTimeout);
            window.clearTimeout(data.flCompleteTimeout);
            window.clearTimeout(data.completeTimeout);
            if (data.mode === "flip-list") {
                window.clearTimeout(data.completeTimeout);
                data.faces.$listTiles.each(function (idx, li) {
                    var ldata = $(li).data("metrojs.tile");
                    window.clearTimeout(ldata.eventTimeout);
                    window.clearTimeout(ldata.flCompleteTimeout);
                    window.clearTimeout(ldata.completeTimeout);
                });
            }
        });
    },
    pause: function () {
        return $(this).each(function (tileIndex, ele) {
            var $tile = $(ele),
                data = $tile.data("LiveTile");
            data.timer.pause();
            data.runEvents = false;
            window.clearTimeout(data.eventTimeout);
            window.clearTimeout(data.flCompleteTimeout);
            window.clearTimeout(data.completeTimeout);
            if (data.mode === "flip-list") {
                data.faces.$listTiles.each(function (idx, li) {
                    var ldata = $(li).data("metrojs.tile");
                    window.clearTimeout(ldata.eventTimeout);
                    window.clearTimeout(ldata.flCompleteTimeout);
                    window.clearTimeout(ldata.completeTimeout);
                });
            }
        });
    },
    restart: function (options) {
        var opts, t = typeof (options);
        if (t === "undefined") {
            opts = {
                delay: -1
            };
        } else if (t === "number") {
            opts = {
                delay: options
            };
        } else if (t === "object") {
            if (typeof (options.delay) === "undefined") {
                options.delay = -1;
            }
            opts = options;
        }
        return $(this).each(function (tileIndex, ele) {
            var $tile = $(ele),
                data = $tile.data("LiveTile");
            if (opts.delay < 0 && !data.hasRun)
                opts.delay = data.initDelay;
            data.hasRun = false;
            data.runEvents = true;
            data.timer.restart(opts.delay >= 0 ? opts.delay : data.delay);
        });
    },
    rebind: function (options) {
        return $(this).each(function (tileIndex, ele) {
            var $tile = $(ele);
            if (typeof (options) !== "undefined") {
                if (typeof (options.timer) !== "undefined" && options.timer != null) {
                    options.timer.stop();
                }                
                options.hasRun = false;
                pubMethods["init"].apply(ele, options);
            } else {
                pubMethods["init"].apply(ele, {});
            }
        });
    },
    destroy: function (options) {
        var t = typeof (options), opts;
        if (t === "undefined") {
            opts = {
                removeCss: false
            };
        } else if (t === "boolean") {
            opts = {
                removeCss: options
            };
        } else if (t === "object") {
            if (typeof (options.removeCss) === "undefined") {
                options.removeCss = false;
            }
            opts = options;
        }
        return $(this).each(function (tileIndex, ele) {
            var $tile = $(ele);
            var data = $tile.data("LiveTile");
            if (typeof (data) === "undefined")
                return;
            $tile.unbind(".liveTile");
            var resetCss = helperMethods.appendStyleProperties({ margin: '', cursor: '' }, ['transform', 'transition'], ['', '']);
            data.timer.stop();
            window.clearTimeout(data.eventTimeout);
            window.clearTimeout(data.flCompleteTimeout);
            window.clearTimeout(data.completeTimeout);
            if (data.faces.$listTiles != null) {
                data.faces.$listTiles.each(function (idx, li) {
                    var $li = $(li);
                    if (data.mode === "flip-list") {
                        var ldata = $li.data("metrojs.tile");
                        window.clearTimeout(ldata.eventTimeout);
                        window.clearTimeout(ldata.flCompleteTimeout);
                        window.clearTimeout(ldata.completeTimeout);
                    } else if (data.mode === "carousel") {
                        var sdata = data.listData[idx];
                        if (sdata.bounce) {
                            privMethods.unbindMsBounce($li, sdata);
                        }
                    }
                    if (opts.removeCss) {
                        $li.removeClass("ha");
                        $li.find(data.tileFaceSelector)
                            .unbind(".liveTile")
                            .removeClass("bounce flip-front flip-back ha slide slide-front slide-back")
                            .css(resetCss);
                    } else {
                        $li.find(data.tileFaceSelector).unbind(".liveTile");
                    }
                    $li.removeData("metrojs.tile");
                }).unbind(".liveTile");
            }
            if (data.faces.$front != null && opts.removeCss) {
                data.faces.$front.removeClass("flip-front flip-back ha slide slide-front slide-back")
                    .css(resetCss);
            }
            if (data.faces.$back != null && opts.removeCss) {
                data.faces.$back.removeClass("flip-front flip-back ha slide slide-front slide-back")
                    .css(resetCss);
            }
            // remove the bounce and hover methods
            // todo: combine all mouse/touch events (down, move, up)
            if (data.bounce) {
                privMethods.unbindMsBounce($tile, data);
            }
            if (data.playOnHover) {
                privMethods.unbindMsPlayOnHover($tile, data);
            }
            if (data.pauseOnhover) {
                privMethods.unbindMsPauseOnHover($tile, data);
            }
            $tile.removeClass("ha");
            $tile.removeData("LiveTile");
            $tile.removeData("metrojs.tile");
            data = null;
        });
    }
};

// private methods that are called by .liveTile
var privMethods = {
    //getDataOrDefault for older versions of jQuery that dont look for 'data-' properties
    dataAtr: function ($ele, name, def) {
        return typeof ($ele.attr('data-' + name)) !== "undefined" ? $ele.attr('data-' + name) : def;
    },
    dataMethod: function ($ele, name, def) {
        return typeof ($ele.data(name)) !== "undefined" ? $ele.data(name) : def;
    },
    getDataOrDefault: null,
    initTileData: function ($tile, stgs) {
        var useData = !stgs.ignoreDataAttributes,
            tdata;
        if (this.getDataOrDefault == null)
            this.getDataOrDefault = metrojs.capabilities.isOldJQuery ? this.dataAtr : this.dataMethod;
        if (useData) {
            tdata = { //an object to store settings for later access                
                speed: this.getDataOrDefault($tile, "speed", stgs.speed),
                delay: this.getDataOrDefault($tile, "delay", stgs.delay),
                stops: this.getDataOrDefault($tile, "stops", stgs.stops),
                stack: this.getDataOrDefault($tile, "stack", stgs.stack),
                mode: this.getDataOrDefault($tile, "mode", stgs.mode),
                direction: this.getDataOrDefault($tile, "direction", stgs.direction),
                useHardwareAccel: this.getDataOrDefault($tile, "ha", stgs.useHardwareAccel),
                repeatCount: this.getDataOrDefault($tile, "repeat", stgs.repeatCount),
                swap: this.getDataOrDefault($tile, "swap", stgs.swap),
                appendBack: this.getDataOrDefault($tile, "appendback", stgs.appendBack),
                currentIndex: this.getDataOrDefault($tile, "start-index", stgs.currentIndex),
                animationDirection: this.getDataOrDefault($tile, "slide-direction", stgs.animationDirection),
                startNow: this.getDataOrDefault($tile, "start-now", stgs.startNow),
                tileSelector: this.getDataOrDefault($tile, "tile-selector", stgs.tileSelector),
                tileFaceSelector: this.getDataOrDefault($tile, "face-selector", stgs.tileFaceSelector),
                bounce: this.getDataOrDefault($tile, "bounce", stgs.bounce),
                link: this.getDataOrDefault($tile, "link", stgs.link),
                newWindow: this.getDataOrDefault($tile, "new-window", stgs.newWindow),
                alwaysTrigger: this.getDataOrDefault($tile, "always-trigger", stgs.alwaysTrigger),
                flipListOnHover: this.getDataOrDefault($tile, "flip-onhover", stgs.flipListOnHover),
                pauseOnHover: this.getDataOrDefault($tile, "pause-onhover", stgs.pauseOnHover),
                playOnHover: this.getDataOrDefault($tile, "play-onhover", stgs.playOnHover),
                onHoverDelay: this.getDataOrDefault($tile, "hover-delay", stgs.onHoverDelay),
                noHAflipOpacity: this.getDataOrDefault($tile, "flip-opacity", stgs.noHAflipOpacity),
                runEvents: false,
                isReversed: false,
                loopCount: 0,
                contentModules: {},
                listData: [],
                height: $tile.height(),
                width: $tile.width(),
                tempValues: {}
            };
        } else {
            tdata = $.extend({
                runEvents: false,
                isReversed: false,
                loopCount: 0,
                contentModules: {},
                listData: [],
                height: $tile.height(),
                width: $tile.width(),
                tempValues: {}
            }, stgs);
        }
        // set the margin to half of the height or width based on the direction
        tdata.margin = (tdata.direction === "vertical") ? tdata.height / 2 : tdata.width / 2;
        // convert stops if needed
        tdata.stops = (typeof (stgs.stops) === "object" && (stgs.stops instanceof Array)) ? stgs.stops : ("" + tdata.stops).split(",");
        // add a return stop
        if (tdata.stops.length === 1)
            tdata.stops.push("0px");
        // add content modules, start with global swaps            
        var swaps = tdata.swap.replace(' ', '').split(",");
        // get the front and back swap data
        var sf = useData ? this.getDataOrDefault($tile, "swap-front", stgs.swapFront) : stgs.swapFront;
        var sb = useData ? this.getDataOrDefault($tile, "swap-back", stgs.swapBack) : stgs.swapBack;
        // set the data to the global value if its still the default
        tdata.swapFront = sf === '-' ? swaps : sf.replace(' ', '').split(",");
        tdata.swapBack = sb === '-' ? swaps : sb.replace(' ', '').split(",");
        // make sure the swaps includes all front and back swaps
        var i;
        for (i = 0; i < tdata.swapFront.length; i++) {
            if (tdata.swapFront[i].length > 0 && $.inArray(tdata.swapFront[i], swaps) === -1)
                swaps.push(tdata.swapFront[i]);
        }
        for (i = 0; i < tdata.swapBack.length; i++) {
            if (tdata.swapBack[i].length > 0 && $.inArray(tdata.swapBack[i], swaps) === -1)
                swaps.push(tdata.swapBack[i]);
        }
        tdata.swap = swaps;
        // add all required content modules for the swaps
        for (i = 0; i < swaps.length; i++) {
            if (swaps[i].length > 0 && typeof ($.fn.liveTile.contentModules.modules[swaps[i]]) !== "undefined") {
                tdata.contentModules[swaps[i]] = $.fn.liveTile.contentModules.modules[swaps[i]];
            }
        }        
        // set the initDelay value to the delay if it's not set
        tdata.initDelay = useData ? this.getDataOrDefault($tile, "initdelay", stgs.initDelay) : stgs.initDelay;
        // if the delay is -1 call the triggerDelay function to get a value
        if (tdata.delay < -1)
            tdata.delay = stgs.triggerDelay(1);
        else if (tdata.delay < 0)
            tdata.delay = 3500 + (Math.random() * 4501);
        // match the delay value if less than 0
        if (tdata.initDelay < 0)
            tdata.initDelay = tdata.delay;
        // merge the objects
        var mergedData = {},
            module;
        for (module in tdata.contentModules)
            $.extend(mergedData, tdata.contentModules[module].data);
        $.extend(mergedData, stgs, tdata);
        // add flip-list / carousel data
        var $tiles;
        if (mergedData.mode === "flip-list") {
            $tiles = $tile.find(mergedData.tileSelector).not(".tile-title");
            $tiles.each(function (idx, ele) {
                var $li = $(ele);
                var ldata = {
                    direction: useData ? privMethods.getDataOrDefault($li, "direction", mergedData.direction) : mergedData.direction,
                    newWindow: useData ? privMethods.getDataOrDefault($li, "new-window", false) : false,
                    link: useData ? privMethods.getDataOrDefault($li, "link", "") : "",
                    faces: { $front: null, $back: null },
                    height: $li.height(),
                    width: $li.width(),
                    isReversed: false
                };
                ldata.margin = ldata.direction === "vertical" ? ldata.height / 2 : ldata.width / 2;
                mergedData.listData.push(ldata);
            });
        } else if (mergedData.mode === "carousel") {
            mergedData.stack = true;
            $tiles = $tile.find(mergedData.tileSelector).not(".tile-title");
            $tiles.each(function (idx, ele) {
                var $slide = $(ele);
                var sdata = {
                    bounce: useData ? privMethods.getDataOrDefault($slide, "bounce", false) : false,
                    link: useData ? privMethods.getDataOrDefault($slide, "link", "") : "",
                    newWindow: useData ? privMethods.getDataOrDefault($slide, "new-window", false) : false,
                    animationDirection: useData ? privMethods.getDataOrDefault($slide, "ani-direction", "") : "",
                    direction: useData ? privMethods.getDataOrDefault($slide, "direction", "") : ""
                };
                mergedData.listData.push(sdata);
            });
        }
        // get any additional options from the modules
        for (module in mergedData.contentModules) {
            if (typeof (mergedData.contentModules[module].initData) === "function")
                mergedData.contentModules[module].initData(mergedData, $tile);
        }
        tdata = null;
        return mergedData;
    },
    prepTile: function ($tile, tdata) {
        //add the mode to the tile if it's not already there.
        $tile.addClass(tdata.mode);
        var ret = {
            $tileFaces: null,     // all possible tile faces in a liveTile in a non list mode
            $listTiles: null,     // all possible tiles in a liveTile in a list mode
            $front: null,         // the front face of a tile in a non list mode
            $back: null          // the back face of a tile in a non list mode
        };
        var rotateDir, backFaceCss, frontCss, backCss;
        // prepare the tile based on the current mode
        switch (tdata.mode) {
            case "slide":
                // front and back tile faces
                ret.$tileFaces = $tile.find(tdata.tileFaceSelector).not(".tile-title");
                // get front face from settings or via selector
                ret.$front = (tdata.faces.$front != null && tdata.faces.$front.length > 0) ?
                                tdata.faces.$front.addClass('slide-front') :
                                ret.$tileFaces.filter(":first").addClass('slide-front'); // using :first for pre jQuery 1.4
                // get back face from settings, via selector, or append it if necessary
                if (tdata.faces.$back != null && tdata.faces.$back.length > 0)    // use $back option
                    ret.$back = tdata.faces.$back.addClass('slide-back');
                else if (ret.$tileFaces.length > 1)                             // get the last tile face
                    ret.$back = ret.$tileFaces.filter(":last").addClass('slide-back');
                else if (tdata.appendBack)                                       // append the back tile
                    ret.$back = $('<div class="slide-back"></div>').appendTo($tile);
                else                                                            // just keep an empty placeholder
                    ret.$back = $('<div></div>');
                // stack mode
                if (tdata.stack == true) {
                    if (tdata.direction === "vertical") {
                        ret.$back.css({ top: -tdata.height + 'px' });
                    } else {
                        ret.$back.css({ left: -tdata.width + 'px' });
                    }
                }
                $tile.data("metrojs.tile", { animating: false });
                if (metrojs.capabilities.canTransition && tdata.useHardwareAccel) {   // hardware accelerated :)                        
                    $tile.addClass("ha");
                    ret.$front.addClass("ha");
                    ret.$back.addClass("ha");
                }                
                break;
            case "carousel":
                ret.$listTiles = $tile.find(tdata.tileSelector).not(".tile-title");
                var numberOfSlides = ret.$listTiles.length;
                $tile.data("metrojs.tile", { animating: false });
                tdata.currentIndex = Math.min(tdata.currentIndex, numberOfSlides - 1);
                ret.$listTiles.each(function (idx, ele) {
                    var $slide = $(ele).addClass("slide");
                    var sdata = tdata.listData[idx],
                        aniDir = typeof (sdata.animationDirection) === "string" && sdata.animationDirection.length > 0 ? sdata.animationDirection : tdata.animationDirection,
                        dir = typeof (sdata.direction) === "string" && sdata.direction.length > 0 ? sdata.direction : tdata.direction;
                    if (idx == tdata.currentIndex) {
                        $slide.addClass("active");
                    } else if (aniDir === "forward") {
                        if (dir === "vertical") {
                            $slide.css({ top: tdata.height + 'px', left:'0px' });
                        } else {
                            $slide.css({ left: tdata.width + 'px', top: '0px' });
                        }
                    } else if (aniDir === "backward") {
                        if (dir === "vertical") {
                            $slide.css({ top: -tdata.height + 'px', left:'0px' });
                        } else {
                            $slide.css({ left: -tdata.width + 'px', top:'0px' });
                        }
                    }
                    // link and bounce can be bound per slide
                    // add the click handler and link property
                    privMethods.bindLink($slide, sdata);
                    // add the bounce effect
                    if (tdata.useHardwareAccel && metrojs.capabilities.canTransition)
                        privMethods.bindBounce($slide, sdata);                    
                    $slide = null;
                    sdata = null;
                });
                // hardware accelerated :)
                if (metrojs.capabilities.canFlip3d && tdata.useHardwareAccel) {
                    $tile.addClass("ha");
                    ret.$listTiles.addClass("ha");
                }
                break;
            case "flip-list":
                // the tile containers inside the list
                ret.$listTiles = $tile.find(tdata.tileSelector).not(".tile-title");
                ret.$listTiles.each(function (idx, ele) {
                    var $li = $(ele).addClass("tile-" + (idx + 1));
                    // add the flip class to the front face
                    var $lFront = $li.find(tdata.tileFaceSelector).filter(":first").addClass("flip-front").css({ margin: "0px" });
                    // append a back tile face if one isnt present
                    if ($li.find(tdata.tileFaceSelector).length === 1 && tdata.appendBack == true)
                        $li.append("<div></div>");
                    // add the flip class to the back face
                    var $lBack = $li.find(tdata.tileFaceSelector).filter(":last").addClass("flip-back").css({ margin: "0px" });
                    // update the tdata object with the faces
                    tdata.listData[idx].faces.$front = $lFront;
                    tdata.listData[idx].faces.$back = $lBack;
                    // set data for overrides and easy access
                    $li.data("metrojs.tile", {
                        animating: false,
                        count: 1,
                        completeTimeout: null,
                        flCompleteTimeout: null,
                        index: idx
                    });
                    var ldata = $li.data("metrojs.tile");
                    // add the hardware accelerated classes
                    if (metrojs.capabilities.canFlip3d && tdata.useHardwareAccel) {   // hardware accelerated :)
                        $li.addClass("ha");
                        $lFront.addClass("ha");
                        $lBack.addClass("ha");
                        rotateDir = tdata.listData[idx].direction === "vertical" ? "rotateX(180deg)" : "rotateY(180deg)";
                        backFaceCss = helperMethods.appendStyleProperties({}, ["transform"], [rotateDir]);
                        $lBack.css(backFaceCss);
                    } else { // not hardware accelerated :(
                        // the front tile face will take up the entire tile
                        frontCss = (tdata.listData[idx].direction === "vertical") ?
								        { height: '100%', width: '100%', marginTop: '0px', opacity: '1' } :
								        { height: '100%', width: '100%', marginLeft: '0px', opacity: '1' };
                        // the back tile face is hidden by default and expanded halfway through a flip
                        backCss = (tdata.listData[idx].direction === "vertical") ?
							            { height: '0px', width: '100%', marginTop: tdata.listData[idx].margin + 'px', opacity: tdata.noHAflipOpacity } :
							            { height: '100%', width: '0px', marginLeft: tdata.listData[idx].margin + 'px', opacity: tdata.noHAflipOpacity };
                        $lFront.css(frontCss);
                        $lBack.css(backCss);
                    }
                    var flipEnded = function() {
                        ldata.count++;
                        if (ldata.count >= MAX_LOOP_COUNT)
                            ldata.count = 1;
                    };
                    if (tdata.flipListOnHover) {
                        var event = tdata.flipListOnHoverEvent + ".liveTile";
                        $lFront.bind(event, function () {
                                privMethods.flip($li, ldata.count, tdata, flipEnded);
                        });
                        $lBack.bind(event, function () {
                                privMethods.flip($li, ldata.count, tdata, flipEnded);
                        });
                    }
                    if (tdata.listData[idx].link.length > 0) {
                        $li.css({ cursor: 'pointer' }).bind("click.liveTile", function () {
                            if (tdata.listData[idx].newWindow)
                                window.open(tdata.listData[idx].link)
                            else
                                window.location = tdata.listData[idx].link;
                        });
                    }
                });
                break;
            case "flip":
                // front and back tile faces
                ret.$tileFaces = $tile.find(tdata.tileFaceSelector).not(".tile-title");
                // get front face from settings or via selector
                ret.$front = (tdata.faces.$front != null && tdata.faces.$front.length > 0) ?
                                tdata.faces.$front.addClass('flip-front') :
                                ret.$tileFaces.filter(":first").addClass('flip-front');
                // get back face from settings, via selector, or append it if necessary
                if (tdata.faces.$back != null && tdata.faces.$back.length > 0) {
                    // use $back option
                    ret.$back = tdata.faces.$back.addClass('flip-back');
                } else if (ret.$tileFaces.length > 1) {
                    // get the last tile face
                    ret.$back = ret.$tileFaces.filter(":last").addClass('flip-back');
                } else if (tdata.appendBack) {
                    // append the back tile
                    ret.$back = $('<div class="flip-back"></div>').appendTo($tile);
                } else {
                    // just keep an empty placeholder
                    ret.$back = $('<div></div>');
                }
                $tile.data("metrojs.tile", { animating: false });
                if (metrojs.capabilities.canFlip3d && tdata.useHardwareAccel) {
                    // hardware accelerated :)
                    $tile.addClass("ha");
                    ret.$front.addClass("ha");
                    ret.$back.addClass("ha");
                    rotateDir = tdata.direction === "vertical" ? "rotateX(180deg)" : "rotateY(180deg)";
                    backFaceCss = helperMethods.appendStyleProperties({}, ["transform"], [rotateDir]);
                    ret.$back.css(backFaceCss);

                } else {
                    // not hardware accelerated :(
                    // the front tile face will take up the entire tile
                    frontCss = (tdata.direction === "vertical") ?
								        { height: '100%', width: '100%', marginTop: '0px', opacity: '1' } :
								        { height: '100%', width: '100%', marginLeft: '0px', opacity: '1' };
                    // the back tile face is hidden by default and expanded halfway through a flip
                    backCss = (tdata.direction === "vertical") ?
							            { height: '0px', width: tdata.width + 'px', marginTop: tdata.margin + 'px', opacity: '0' } :
							            { height: tdata.height + 'px', width: '0px', marginLeft: tdata.margin + 'px', opacity: '0' };
                    ret.$front.css(frontCss);
                    ret.$back.css(backCss);
                }
                break;
        }
        return ret;
    },
    bindPauseOnHover: function($tile){        
        // stop the tile when hovered and resume after a delay
        (function () {
            var data = $tile.data("LiveTile"),
                isOver = false,
                isPending = false;
            data.pOnHoverMethods = {
                over: function (e) {
                    if (isOver || isPending)
                        return;
                    if (data.runEvents) {
                        isPending = true;
                        data.eventTimeout = window.setTimeout(function () {
                            isPending = false;
                            isOver = true;
                            data.timer.pause();
                            if (data.mode === "flip-list") {
                                data.faces.$listTiles.each(function (idx, li) {
                                    window.clearTimeout($(li).data("metrojs.tile").completeTimeout);
                                });
                            }
                        }, data.onHoverDelay);
                    }
                },
                out: function (e) {
                    if (isPending) {
                        window.clearTimeout(data.eventTimeout);
                        isPending = false;
                        return;
                    }
                    if (!isOver && !isPending)
                        return;
                    if (data.runEvents)
                        data.timer.start(data.hasRun ? data.delay : data.initDelay);
                    isOver = false;
                }
            };
            if (!metrojs.capabilities.canTouch) {
                $tile.bind("mouseover.liveTile", data.pOnHoverMethods.over);
                $tile.bind("mouseout.liveTile", data.pOnHoverMethods.out);
            } else {
                if (window.navigator.msPointerEnabled) { // pointer
                    $tile[0].addEventListener('MSPointerOver', data.pOnHoverMethods.over, false);
                    $tile[0].addEventListener('MSPointerOut', data.pOnHoverMethods.out, false);
                } else { // touch events
                    $tile.bind("touchstart.liveTile", data.pOnHoverMethods.over);
                    $tile.bind("touchend.liveTile", data.pOnHoverMethods.out);
                }

            }
        })();
    },
    unbindMsPauseOnHover: function ($tile, data) {
        if (typeof (data.pOnHoverMethods) !== "undefined" && window.navigator.msPointerEnabled) {
            $tile[0].removeEventListener('MSPointerOver', data.pOnHoverMethods.over, false);
            $tile[0].removeEventListener('MSPointerOut', data.pOnHoverMethods.out, false);
        }
    },
    bindPlayOnHover: function ($tile) {
        // play the tile immediately when hovered
        (function () {
            var data = $tile.data("LiveTile"),
                isOver = false,
                isPending = false;
            data.onHoverMethods = {
                over: function(event) {
                    if (isOver || isPending)
                        return;
                    // if startNow is set use the opposite of isReversed so we're in sync            
                    var rev = data.startNow ? !data.isReversed : data.isReversed;
                    window.clearTimeout(data.eventTimeout);
                    if ((data.runEvents && rev) || !data.hasRun) {
                        isPending = true;
                        data.eventTimeout = window.setTimeout(function () {
                            isPending = false;
                            isOver = true;
                            pubMethods["play"].apply($tile[0], [0]);
                        }, data.onHoverDelay);
                    }            
                },
                out: function(event) {
                    if (isPending) {
                        window.clearTimeout(data.eventTimeout);
                        isPending = false;
                        return;
                    }
                    if (!isOver && !isPending)
                        return;
                    window.clearTimeout(data.eventTimeout);
                    data.eventTimeout = window.setTimeout(function () {
                        var rev = data.startNow ? data.isReversed : !data.isReversed;
                        if (data.runEvents && rev) {
                            pubMethods["play"].apply($tile[0], [0]);
                        }
                        isOver = false;
                    }, data.speed + 200);            
                }
            };
            $tile.addClass("noselect");
            if (!metrojs.capabilities.canTouch) {
                $tile.bind('mouseenter.liveTile', function (e) {                    
                    data.onHoverMethods.over(e);
                });
                $tile.bind('mouseleave.liveTile', function (e) {                    
                        data.onHoverMethods.out(e);
                });            
                //$tile.bind("mouseenter.liveTile", over);
                //$tile.bind("mouseleave.liveTile", out);
            } else {
                if (window.navigator.msPointerEnabled) { // pointer
                    $tile[0].addEventListener('MSPointerDown', data.onHoverMethods.over, false);
                    // mouseleave gives a more consistent effect than out when the children are transformed
                    $tile.bind("mouseleave.liveTile", data.onHoverMethods.out);
                } else { // touch events
                    $tile.bind("touchstart.liveTile", data.onHoverMethods.over);
                    $tile.bind("touchend.liveTile", data.onHoverMethods.out);
                }

            }
        })();
    },
    unbindMsPlayOnHover: function ($tile, data) {
        if (typeof (data.onHoverMethods) !== "undefined" && window.navigator.msPointerEnabled) {
            $tile[0].removeEventListener('MSPointerDown', data.onHoverMethods.over, false);
        }
    },
    bindBounce: function($tile, data){
        // add bounce
        if (data.bounce) {
            var bounceCss = helperMethods.appendStyleProperties({}, ['transition-property', 'transition-duration'], ['scale', '200ms']);
            $tile.addClass("bounce");
            (function () {                
                data.bounceMethods = {
                    down: false,
                    threshold: 10,
                    zeroPos: { x: 0, y: 0 },
                    prevPos: { x: 0, y: 0 },
                    bounceDown: function (e) {
                        this.prevPos = {
                            x: e.pageX, // todo: transform based on mouse pos? e.pageX - parentOffset.left,
                            y: e.pageY // e.pageY - parentOffset.top
                        };
                        $tile.addClass("bounce-dwn");
                        this.down = true;
                    },
                    bounceUp: function() {
                        if (this.down === true) {
                            data.bounceMethods.unBounce();
                        }
                    },
                    bounceMove: function(e) {
                        if (this.down === true) {
                            if (Math.abs(e.pageX - prevPos.x) > this.threshold || Math.abs(e.pageY - prevPos.y) > this.threshold) {
                                //data.bounceMethods.unBounce();
                            }
                        }
                    },
                    unBounce: function () {
                        $tile.removeClass("bounce-dwn");
                        this.down = false;
                        this.prevPos = this.zeroPos;
                    }
                };            
                // IE 10+
                if (window.navigator.msPointerEnabled) {// touch only -> // && window.navigator.msMaxTouchPoints) {
                    $tile[0].addEventListener('MSPointerDown', data.bounceMethods.bounceDown, false);
                    $tile[0].addEventListener('MSPointerCancel', data.bounceMethods.bounceUp, false);
                    $tile[0].addEventListener('MSPointerOut', data.bounceMethods.bounceUp, false);
                    $tile[0].addEventListener('MSPointerUp', data.bounceMethods.bounceUp, false);
                    //$tile[0].addEventListener('MSPointerMove', data.bounceMethods.bounceMove, false);
                } else {
                    // everybody else
                    $tile.bind("mousedown.liveTile touchstart.liveTile", data.bounceMethods.bounceDown);
                    $tile.bind("mouseup.liveTile touchend.liveTile, mouseout.liveTile touchcancel.liveTile", data.bounceMethods.bounceUp);
                    // $tile.bind("mousemove.liveTile touchmove.liveTile", data.bounceMethods.bounceMove);
                }
            })();
        }
    },
    unbindMsBounce: function($tile, data){
        if(data.bounce && window.navigator.msPointerEnabled) {// touch only -> // && window.navigator.msMaxTouchPoints) {
            $tile[0].removeEventListener('MSPointerDown', data.bounceMethods.bounceDown, false);
            $tile[0].removeEventListener('MSPointerCancel', data.bounceMethods.bounceUp, false);
            $tile[0].removeEventListener('MSPointerOut', data.bounceMethods.bounceUp, false);
            //$tile[0].removeEventListener('MSPointerMove', data.bounceMethods.bounceMove, false);
        }        
    },
    bindLink: function($tile, data){
        if (data.link.length > 0) {
            $tile.css({ cursor: 'pointer' }).bind("click.liveTile", function () {
                if (data.newWindow)
                    window.open(data.link);
                else
                    window.location = data.link;
            });
        }
    },
    slide: function ($tile, count, data, stopIndex, callback) {
        var tdata = typeof (data) === "undefined" ? $tile.data("LiveTile") : data;
        var aniData = $tile.data("metrojs.tile");
        if (aniData.animating == true || $tile.is(":animated")) {
            tdata = null;
            aniData = null;
            return;
        }
        if (tdata.mode !== "carousel") {
            tdata.isReversed = count % 2 === 0;  // the count starts at 1
        } else
            tdata.isReversed = true; // in carousel mode the face that just left the stage is always the $back
        tdata.timer.pause();
        // get temp values passed in from data methods            
        var direction;
        if (typeof (tdata.tempValues.direction) === "string" && tdata.tempValues.direction.length > 0)
            direction = tdata.tempValues.direction;
        else
            direction = tdata.direction;
        tdata.tempValues.direction = null;
        var css = {},
            cssback = {},
            // the stop index is overridden in carousel mode
            stopIdx = typeof (stopIndex) === "undefined" ? tdata.currentIndex : stopIndex,
            stop = $.trim(tdata.stops[Math.min(stopIdx, tdata.stops.length - 1)]),
            pxIdx = stop.indexOf('px'),
            offset = 0,
            amount = 0,
            metric = (direction === "vertical") ? tdata.height : tdata.width,
            tProp = (direction === "vertical") ? "top" : "left";        
        // when the slide is complete increment the index or call the callback
        var slideFinished = function () {
            if (typeof (callback) === "undefined") {
                tdata.currentIndex = tdata.currentIndex + 1;
                if (tdata.currentIndex > tdata.stops.length - 1) {
                    tdata.currentIndex = 0;
                }
            } else {
                callback();
            }
            // run content modules and animationComplete callback
            for (var module in tdata.contentModules)
                tdata.contentModules[module].action(tdata, tdata.faces.$front, tdata.faces.$back, tdata.currentIndex);
            tdata.animationComplete(tdata, tdata.faces.$front, tdata.faces.$back);
            // if the tile should run again start the timer back with the current delay
            if (tdata.timer.repeatCount > 0 || tdata.timer.repeatCount == -1) {
                if (tdata.timer.count != tdata.timer.repeatCount) {
                    tdata.timer.start(tdata.delay);                    
                }
            }
            tdata = null;
            aniData = null;
        };
        if (pxIdx > 0) {
            amount = parseInt(stop.substring(0, pxIdx), 10);
            offset = (amount - metric) + 'px';
        } else {
            //is a percentage
            amount = parseInt(stop.replace('%', ''), 10);
            offset = (amount - 100) + '%';
        }
        // hardware accelerated :)
        if (metrojs.capabilities.canTransition && tdata.useHardwareAccel) {
            if (typeof (aniData.animating) !== "undefined" && aniData.animating == true)
                return;
            aniData.animating = true;
            css = helperMethods.appendStyleProperties(css, ['transition-property', 'transition-duration', 'transition-timing-function'], [tProp, tdata.speed + 'ms', tdata.haTransFunc]);
            if (direction === "vertical")
                css.top = stop;
            else
                css.left = stop;
            tdata.faces.$front.css(css);
            if (tdata.stack == true) {
                if (direction === "vertical")
                    css.top = offset;
                else
                    css.left = offset;
                tdata.faces.$back.css(css);
            }            
            window.clearTimeout(tdata.completeTimeout);
            tdata.completeTimeout = window.setTimeout(function () {
                aniData.animating = false;
                slideFinished();
            }, tdata.speed);
        } else {
            // not hardware accelerated :(
            css[tProp] = stop;
            cssback[tProp] = offset;
            aniData.animating = true;
            tdata.faces.$front.stop().animate(css, tdata.speed, tdata.noHaTransFunc, function () {
                aniData.animating = false;
                slideFinished();
            });
            if (tdata.stack == true) {
                // change the css value to the offset                
                tdata.faces.$back.stop().animate(cssback, tdata.speed, tdata.noHaTransFunc, function () { });
            }
        }
    },
    carousel: function ($tile, count) {
        var tdata = $tile.data("LiveTile");
        // dont update css or call slide if animated or if there's only one face
        var aniData = $tile.data("metrojs.tile");
        if (aniData.animating == true || tdata.faces.$listTiles.length <= 1) {
            aniData = null;
            return;
        }
        // pause the timer and use a per slide delay
        tdata.timer.pause();
        var $cur = tdata.faces.$listTiles.filter(".active"),
            idx = tdata.faces.$listTiles.index($cur),
            goTo = tdata.currentIndex,
            eq = goTo != idx ? goTo : idx,
            nxtIdx = eq + 1 >= tdata.faces.$listTiles.length ? 0 : eq + 1,
            sdata = tdata.listData[nxtIdx];
        if (idx == nxtIdx) {
            aniData = null;
            $cur = null;
            return;
        }
        // get temp values passed in from data methods
        var animationDirection;
        if (typeof (tdata.tempValues.animationDirection) === "string" && tdata.tempValues.animationDirection.length > 0)
            animationDirection = tdata.tempValues.animationDirection;
        else if (typeof (sdata.animationDirection) === "string" && sdata.animationDirection.length > 0) {
            animationDirection = sdata.animationDirection;
        }else
            animationDirection = tdata.animationDirection;
        // the temp value for animation direction is not used in slide: so i'm setting it to null
        tdata.tempValues.animationDirection = null;
        var direction;
        if (typeof (tdata.tempValues.direction) === "string" && tdata.tempValues.direction.length > 0){
            direction = tdata.tempValues.direction;
        } else if (typeof (sdata.direction) === "string" && sdata.direction.length > 0) {
            direction = sdata.direction;
            tdata.tempValues.direction = direction;
        } else {
            direction = tdata.direction;
        }
        var $nxt = tdata.faces.$listTiles.eq(nxtIdx);
        var nxtCss = helperMethods.appendStyleProperties({}, ['transition-duration'], ['0s']);        
        if (animationDirection === "backward") {
            if (direction === "vertical") {                
                nxtCss.top = "-100%";
                nxtCss.left = "0px";
            } else {
                nxtCss.top = "0px";
                nxtCss.left = "-100%";                
            }
            tdata.faces.$front = $cur;
            tdata.faces.$back = $nxt;
            tdata.stops = ['100%'];
        } else {
            if (direction === "vertical") {
                nxtCss.top = "100%";
                nxtCss.left = "0px";
            } else {
                nxtCss.top = "0px";
                nxtCss.left = "100%";                
            }
            tdata.faces.$front = $nxt;
            tdata.faces.$back = $cur;
            tdata.stops = ['0px'];
        }
        $nxt.css(nxtCss);
        // the timeout wrapper gives the css call above enough time to finish in case we dynamically set the direction
        window.setTimeout(function () {            
            
            privMethods.slide($tile, count, tdata, 0, function ()
            {   
                $cur.removeClass("active");
                $nxt.addClass("active");
                tdata.currentIndex = nxtIdx;
                aniData = null;
                $cur = null;
                $nxt = null;
                if (tdata.timer.repeatCount > 0 || tdata.timer.repeatCount == -1) {
                    if (tdata.timer.count != tdata.timer.repeatCount) {
                        tdata.timer.start(tdata.delay);
                    }
                }
            });
        }, 200);

    },
    flip: function ($tile, count, data, callback) {
        var aniData = $tile.data("metrojs.tile");
        if (aniData.animating == true) {
            anidata = null;
            return;
        }
        var tdata = typeof (data) === "object" ? data : $tile.data("LiveTile");
        var $front, $back, direction, deg, rotateDir, css,
            raiseEvt = typeof (callback) === "undefined",
            index = 0,
            isReversed = count % 2 === 0;  // the count starts at 1
        if (tdata.mode === "flip-list") {
            index = aniData.index;
            $front = tdata.listData[index].faces.$front;
            $back = tdata.listData[index].faces.$back;
            tdata.listData[index].isReversed = isReversed;
            direction = tdata.listData[index].direction;
            height = tdata.listData[index].height;
            width = tdata.listData[index].width;
            margin = tdata.listData[index].margin;
        } else {
            $front = tdata.faces.$front;
            $back = tdata.faces.$back;
            tdata.isReversed = isReversed;
            direction = tdata.direction;
            height = tdata.height;
            width = tdata.width;
            margin = tdata.margin;
        }
        if (metrojs.capabilities.canFlip3d && tdata.useHardwareAccel) { // Hardware accelerated :)
            deg = !isReversed ? "180deg" : "360deg";
            rotateDir = direction === "vertical" ? "rotateX(" + deg + ")" : "rotateY(" + deg + ")";
            css = helperMethods.appendStyleProperties({}, ["transform", "transition"], [rotateDir, "all " + tdata.speed + "ms " + tdata.haTransFunc + " 0s"]);
            var bDeg = !isReversed ? "360deg" : "540deg";
            var bRotateDir = direction === "vertical" ? "rotateX(" + bDeg + ")" : "rotateY(" + bDeg + ")";
            var bCss = helperMethods.appendStyleProperties({}, ["transform", "transition"], [bRotateDir, "all " + tdata.speed + "ms " + tdata.haTransFunc + " 0s"]);
            $front.css(css);
            $back.css(bCss);

            var action = function () {
                aniData.animating = false;
                var resetDir, newCss, module;
                if (!isReversed) {
                    for (module in tdata.contentModules)
                        tdata.contentModules[module].action(tdata, $back, $front, index);
                    if (raiseEvt)
                        tdata.animationComplete(tdata, $back, $front);
                    else
                        callback(tdata, $back, $front);
                } else {                    
                        resetDir = direction === "vertical" ? "rotateX(0deg)" : "rotateY(0deg)";
                        newCss = helperMethods.appendStyleProperties({}, ["transform", "transition"], [resetDir, "all 0s " + tdata.haTransFunc + " 0s"]);
                        //aggressively resetting the direction appears to cause some issues on IE10 on WinRT
                        //var bResetDir = direction === "vertical" ? "rotateX(180deg)" : "rotateY(180deg)";
                        //var bNewCss = helperMethods.appendStyleProperties({}, ["transition"], ["all 0s ease 0s"]);
                        $front.css(newCss);
                        //$back.css(bNewCss);
                        //window.setTimeout(function () {
                            //bNewCss = helperMethods.appendStyleProperties(bNewCss, ["transform"], [bResetDir]);
                            //$back.css(bNewCss);
                            //console.log('nil');
                        //}, 50);
                        //call content modules
                        for (module in tdata.contentModules)
                            tdata.contentModules[module].action(tdata, $front, $back, index);
                        if (raiseEvt)
                            tdata.animationComplete(tdata, $front, $back);
                        else
                            callback(tdata, $front, $back);
                        $front = null;
                        $back = null;
                        tdata = null;
                        aniData = null;
                   
                }
            };
            if (tdata.mode === "flip-list") {
                window.clearTimeout(tdata.listData[index].completeTimeout);
                tdata.listData[index].completeTimeout = window.setTimeout(action, tdata.speed);
            } else {
                window.clearTimeout(tdata.completeTimeout);
                tdata.completeTimeout = window.setTimeout(action, tdata.speed);
            }
        } else { // not Hardware accelerated :(
            var speed = tdata.speed / 2;
            var hideCss = (direction === "vertical") ?
							   { height: '0px', width: '100%', marginTop: margin + 'px', opacity: tdata.noHAflipOpacity } :
							   { height: '100%', width: '0px', marginLeft: margin + 'px', opacity: tdata.noHAflipOpacity };
            var showCss = (direction === "vertical") ?
								{ height: '100%', width: '100%', marginTop: '0px', opacity: '1' } :
								{ height: '100%', width: '100%', marginLeft: '0px', opacity: '1' };
            var noHaAction;
            if (!isReversed) {
                aniData.animating = true;
                $front.stop().animate(hideCss, { duration: speed });
                noHaAction = function () {                    
                    aniData.animating = false;
                    $back.stop().animate(showCss, {
                        duration: speed, complete: function () {
                            for (var module in tdata.contentModules)
                                tdata.contentModules[module].action(tdata, $back, $front, index);
                            if (raiseEvt)
                                tdata.animationComplete(tdata, $back, $front);
                            else
                                callback(tdata, $back, $front);
                            $front = null;
                            $back = null;
                            tdata = null;
                            aniData = null;
                        }
                    });
                };
                if (tdata.mode === "flip-list") {      
                    window.clearTimeout(tdata.listData[aniData.index].completeTimeout);
                    tdata.listData[aniData.index].completeTimeout = window.setTimeout(noHaAction, speed);
                } else {
                    window.clearTimeout(tdata.completeTimeout);
                    tdata.completeTimeout = window.setTimeout(noHaAction, speed);
                }
            } else {
                aniData.animating = true;
                $back.stop().animate(hideCss, { duration: speed });
                noHaAction = function () {
                    aniData.animating = false;
                    $front.stop().animate(showCss, {
                        duration: speed, complete: function () {
                            for (var module in tdata.contentModules)
                                tdata.contentModules[module].action(tdata, $front, $back, index);
                            if (raiseEvt)
                                tdata.animationComplete(tdata, $front, $back);
                            else
                                callback(tdata, $front, $back);
                            aniData = null;
                            $front = null;
                            $back = null;
                        }
                    });
                };
                if (tdata.mode === "flip-list") {
                    window.clearTimeout(tdata.listData[aniData.index].completeTimeout);
                    tdata.listData[aniData.index].completeTimeout = window.setTimeout(noHaAction, speed);
                } else {
                    window.clearTimeout(tdata.completeTimeout);
                    tdata.completeTimeout = window.setTimeout(noHaAction, speed);
                }
            }

        }
    },    
    flipList: function ($tile, count) {
        var tdata = $tile.data("LiveTile");
        var maxDelay = tdata.speed;
        var triggered = false;
        tdata.timer.pause();
        tdata.faces.$listTiles.each(function (idx, ele) {
            var $li = $(ele);
            var ldata = $li.data("metrojs.tile");            
            var tDelay = tdata.triggerDelay(idx);
            var triggerDelay = tdata.speed + Math.max(tDelay, 0);
            var trigger = tdata.alwaysTrigger;
            if (!trigger)
                trigger = (Math.random() * 351) > 150 ? true : false;
            if (trigger) {
                triggered = true;
                maxDelay = Math.max(triggerDelay + tdata.speed, maxDelay);                
                window.clearTimeout(ldata.flCompleteTimeout);
                ldata.flCompleteTimeout = window.setTimeout(function () {                    
                    // call the flip method with the merged data, but dont fire animationComplete
                    privMethods.flip($li, ldata.count, tdata, function (data) {                        
                        ldata.count++;                        
                        if (ldata.count >= MAX_LOOP_COUNT)
                            ldata.count = 1;
                        $li = null;
                        ldata = null;
                    });
                }, triggerDelay);
            }
        });
        if (triggered) {
            window.clearTimeout(tdata.flCompleteTimeout);
            tdata.flCompleteTimeout = window.setTimeout(function () {
                for (var module in tdata.contentModules)
                    tdata.contentModules[module].action(tdata, null, null, -1);
                tdata.animationComplete(tdata, null, null);
                if (tdata.timer.repeatCount > 0 || tdata.timer.repeatCount == -1) {
                    if (tdata.timer.count != tdata.timer.repeatCount) {
                        tdata.timer.start(tdata.delay);
                    }
                }
                //tdata = null;
            }, maxDelay + tdata.speed); // add some padding to make sure the final callback finished
            
        }
    }
};


// methods that can be called more universally
var helperMethods = {
    stylePrefixes: 'Webkit Moz O ms Khtml '.split(' '),
    domPrefixes: '-webkit- -moz- -o- -ms- -khtml- '.split(' '),
    // a method to append css3 properties for each browser
    // note: values are identical for each property
    appendStyleProperties: function (obj, names, values) {
        for (var i = 0; i <= names.length - 1; i++) {
            for (var j = 0; j <= this.domPrefixes.length - 1; j++)
                obj[$.trim(this.domPrefixes[j] + names[i])] = values[i];
        }
        return obj;
    },
    //a shuffle method to provide more randomness than sort
    //credit: http://javascript.about.com/library/blshuffle.htm
    //note: avoiding prototype for sharepoint compatability
    shuffleArray: function (array) {
        var s = [];
        while (array.length) s.push(array.splice(Math.random() * array.length, 1));
        while (s.length) array.push(s.pop());
        return array;
    }
};

var defaultModules = {
    customSwap: {
        data: {
            customDoSwapFront: function () { return false; },
            customDoSwapBack: function () { return false; },
            customGetContent: function(tdata, $front, $back, index) { return null; }
        },
        initData: function (tdata, $ele) {
            var swapData = {};
            swapData.doSwapFront = $.inArray('custom', tdata.swapFront) > -1 && tdata.customDoSwapFront();
            swapData.doSwapBack = $.inArray('custom', tdata.swapBack) > -1 && tdata.customDoSwapBack();
            if (typeof (tdata.customSwap) !== "undefined")
                tdata.customSwap = $.extend(swapData, tdata.customSwap);
            else
                tdata.customSwap = swapData;
        },
        action: function (tdata, $front, $back, index) {

        }
    },
    htmlSwap: {
        data: { // public data for the swap module                
            frontContent: [],                       // a list of html to use for the front
            frontIsRandom: true,                    // should html be chosen at random or in order                
            frontIsInGrid: false,                   // only chooses one item for each iteration in flip-list                
            backContent: [],                        // a list of html to use for the back
            backIsRandom: true,                     // should html be chosen at random or in order                
            backIsInGrid: false                     // only chooses one item for each iteration in flip-list                
        },
        initData: function (tdata, $ele) {
            var swapData = { // private data for the swap module
                backBag: [],
                backIndex: 0,
                backStaticIndex: 0,
                backStaticRndm: -1,
                prevBackIndex: -1,
                frontBag: [],
                frontIndex: 0,
                frontStaticIndex: 0,
                frontStaticRndm: -1,
                prevFrontIndex: -1
            };
            swapData.frontIsRandom = !tdata.ignoreDataAttributes ? privMethods.getDataOrDefault($ele, "front-israndom", tdata.frontIsRandom) : tdata.frontIsRandom;
            swapData.frontIsInGrid = !tdata.ignoreDataAttributes ? privMethods.getDataOrDefault($ele, "front-isingrid", tdata.frontIsInGrid) : tdata.frontIsInGrid;            
            swapData.backIsRandom = !tdata.ignoreDataAttributes ? privMethods.getDataOrDefault($ele, "back-israndom", tdata.backIsRandom) : tdata.backIsRandom;
            swapData.backIsInGrid = !tdata.ignoreDataAttributes ? privMethods.getDataOrDefault($ele, "back-isingrid", tdata.backIsInGrid) : tdata.backIsInGrid;            
            swapData.doSwapFront = $.inArray('html', tdata.swapFront) > -1 && (tdata.frontContent instanceof Array) && tdata.frontContent.length > 0;
            swapData.doSwapBack = $.inArray('html', tdata.swapBack) > -1 && (tdata.backContent instanceof Array) && tdata.backContent.length > 0;
            if (typeof (tdata.htmlSwap) !== "undefined")
                tdata.htmlSwap = $.extend(swapData, tdata.htmlSwap);
            else
                tdata.htmlSwap = swapData;
            if (tdata.htmlSwap.doSwapFront) {
                tdata.htmlSwap.frontBag = this.prepBag(tdata.htmlSwap.frontBag, tdata.frontContent, tdata.htmlSwap.prevFrontIndex);
                tdata.htmlSwap.frontStaticRndm = tdata.htmlSwap.frontBag.pop();
            }
            if (tdata.htmlSwap.doSwapBack) {
                tdata.htmlSwap.backBag = this.prepBag(tdata.htmlSwap.backBag, tdata.backContent, tdata.htmlSwap.prevBackIndex);
                tdata.htmlSwap.backStaticRndm = tdata.htmlSwap.backBag.pop();
            }
        },
        prepBag: function (bag, content, prevIdx) {
            bag = [];
            var bagCount = 0;
            for (var i = 0; i < content.length; i++) {
                //make sure there's not an immediate repeat
                if (i != prevIdx || bag.length === 1) {
                    bag[bagCount] = i;
                    bagCount++;
                }
            }
            return helperMethods.shuffleArray(bag);
        },
        getFrontSwapIndex: function (tdata) {
            var idx = 0;
            if (!tdata.htmlSwap.frontIsRandom) {
                idx = tdata.htmlSwap.frontIsInGrid ? tdata.htmlSwap.frontStaticIndex : tdata.htmlSwap.frontIndex;
            } else {
                if (tdata.htmlSwap.frontBag.length === 0) {
                    tdata.htmlSwap.frontBag = this.prepBag(tdata.htmlSwap.frontBag, tdata.frontContent, tdata.htmlSwap.prevFrontIndex);
                }
                if (tdata.htmlSwap.frontIsInGrid) {
                    idx = tdata.htmlSwap.frontStaticRndm;
                } else {
                    idx = tdata.htmlSwap.frontBag.pop();
                }
            }
            return idx;
        },
        getBackSwapIndex: function (tdata) {
            var idx = 0;
            if (!tdata.htmlSwap.backIsRandom) {
                idx = tdata.htmlSwap.backIsInGrid ? tdata.htmlSwap.backStaticIndex : tdata.htmlSwap.backIndex;
            } else {
                if (tdata.htmlSwap.backBag.length === 0) {
                    tdata.htmlSwap.backBag = this.prepBag(tdata.htmlSwap.backBag, tdata.backContent, tdata.htmlSwap.prevBackIndex);
                }
                if (tdata.htmlSwap.backIsInGrid) {
                    idx = tdata.htmlSwap.backStaticRndm;
                } else {
                    idx = tdata.htmlSwap.backBag.pop();
                }
            }
            return idx;
        },
        action: function (tdata, $front, $back, index) {
            if (!tdata.htmlSwap.doSwapFront && !tdata.htmlSwap.doSwapBack)
                return;
            var isList = tdata.mode === "flip-list";
            var swapIndex = 0;
            var isReversed = isList ? tdata.listData[Math.max(index, 0)].isReversed : tdata.isReversed;
            if (isList && index == -1) {
                // flip list completed
                if (!isReversed) {
                    if (tdata.htmlSwap.doSwapFront) {
                        // update the random value for grid mode
                        if (tdata.htmlSwap.frontBag.length === 0)
                            tdata.htmlSwap.frontBag = this.prepBag(tdata.htmlSwap.frontBag, tdata.frontContent, tdata.htmlSwap.frontStaticRndm);
                        tdata.htmlSwap.frontStaticRndm = tdata.htmlSwap.frontBag.pop();
                        // update the static index
                        tdata.htmlSwap.frontStaticIndex++;
                        if (tdata.htmlSwap.frontStaticIndex >= tdata.frontContent.length)
                            tdata.htmlSwap.frontStaticIndex = 0;
                    }
                } else {
                    if (tdata.htmlSwap.doSwapBack) {
                        // update the random value for grid mode
                        if (tdata.htmlSwap.backBag.length === 0)
                            tdata.htmlSwap.backBag = this.prepBag(tdata.htmlSwap.backBag, tdata.backContent, tdata.htmlSwap.backStaticRndm);
                        tdata.htmlSwap.backStaticRndm = tdata.htmlSwap.backBag.pop();
                        // update the static index
                        tdata.htmlSwap.backStaticIndex++;
                        if (tdata.htmlSwap.backStaticIndex >= tdata.backContent.length)
                            tdata.htmlSwap.backStaticIndex = 0;
                    }
                }
                return;
            }
            if (!isReversed) {
                if (!tdata.htmlSwap.doSwapFront)
                    return;
                swapIndex = this.getFrontSwapIndex(tdata);
                tdata.htmlSwap.prevFrontIndex = swapIndex;
                if (tdata.mode === "slide") {
                    if (!tdata.startNow)
                        $front.html(tdata.frontContent[swapIndex]);
                    else
                        $back.html(tdata.frontContent[swapIndex]);
                } else
                    $back.html(tdata.frontContent[swapIndex]);
                // increment the front index to get the next item from the list
                tdata.htmlSwap.frontIndex++;
                if (tdata.htmlSwap.frontIndex >= tdata.frontContent.length)
                    tdata.htmlSwap.frontIndex = 0;
                if (!isList) {
                    // increment the static index if we're not in list mode
                    tdata.htmlSwap.frontStaticIndex++;
                    if (tdata.htmlSwap.frontStaticIndex >= tdata.frontContent.length)
                        tdata.htmlSwap.frontStaticIndex = 0;
                } else {
                    // flip list
                }
            } else {
                if (!tdata.htmlSwap.doSwapBack)
                    return;
                swapIndex = this.getBackSwapIndex(tdata);
                tdata.htmlSwap.prevBackIndex = swapIndex;
                $back.html(tdata.backContent[tdata.htmlSwap.backIndex]);
                tdata.htmlSwap.backIndex++;
                if (tdata.htmlSwap.backIndex >= tdata.backContent.length)
                    tdata.htmlSwap.backIndex = 0;
                if (!isList) {
                    tdata.htmlSwap.backStaticIndex++;
                    if (tdata.htmlSwap.backStaticIndex >= tdata.backContent.length)
                        tdata.htmlSwap.backStaticIndex = 0;
                } else {
                    // flip list
                }
            }
        }
    },
    imageSwap: {
        data: {
            preloadImages: false,
            imageCssSelector: '>img,>a>img',        // the selector used to choose a an image to apply a src or background to
            frontImages: [],                        // a list of images to use for the front
            frontIsRandom: true,                    // should images be chosen at random or in order
            frontIsBackgroundImage: false,          // set the src attribute or css background-image property
            frontIsInGrid: false,                    // only chooses one item for each iteration in flip-list
            backImages: null,                       // a list of images to use for the back
            backIsRandom: true,                     // should images be chosen at random or in order
            backIsBackgroundImage: false,           // set the src attribute or css background-image property
            backIsInGrid: false                     // only chooses one item for each iteration in flip-list                
        },
        initData: function (tdata, $ele) {
            var swapData = {
                backBag: [],
                backIndex: 0,
                backStaticIndex: 0,
                backStaticRndm: -1,
                frontBag: [],
                frontIndex: 0,
                frontStaticIndex: 0,
                frontStaticRndm: -1,
                prevBackIndex: -1,
                prevFrontIndex: -1
            };
            swapData.imageCssSelector = !tdata.ignoreDataAttributes ? privMethods.getDataOrDefault($ele, "image-css", tdata.imageCssSelector) : tdata.imageCssSelector;
            swapData.frontIsRandom = !tdata.ignoreDataAttributes ? privMethods.getDataOrDefault($ele, "front-israndom", tdata.frontIsRandom) : tdata.frontIsRandom;
            swapData.frontIsInGrid = !tdata.ignoreDataAttributes ? privMethods.getDataOrDefault($ele, "front-isingrid", tdata.frontIsInGrid) : tdata.frontIsInGrid;
            swapData.frontIsBackgroundImage = !tdata.ignoreDataAttributes ? privMethods.getDataOrDefault($ele, "front-isbg", tdata.frontIsBackgroundImage) : tdata.frontIsBackgroundImage;
            swapData.backIsRandom = !tdata.ignoreDataAttributes ? privMethods.getDataOrDefault($ele, "back-israndom", tdata.backIsRandom) : tdata.backIsRandom;
            swapData.backIsInGrid = !tdata.ignoreDataAttributes ? privMethods.getDataOrDefault($ele, "back-isingrid", tdata.backIsInGrid) : tdata.backIsInGrid;
            swapData.backIsBackgroundImage = !tdata.ignoreDataAttributes ? privMethods.getDataOrDefault($ele, "back-isbg", tdata.backIsBackgroundImage) : tdata.backIsBackgroundImage;
            swapData.doSwapFront = $.inArray('image', tdata.swapFront) > -1 && (tdata.frontImages instanceof Array) && tdata.frontImages.length > 0;
            swapData.doSwapBack = $.inArray('image', tdata.swapBack) > -1 && (tdata.backImages instanceof Array) && tdata.backImages.length > 0;
            if(typeof(tdata.imgSwap) !== "undefined")
                tdata.imgSwap = $.extend(swapData, tdata.imgSwap);
            else
                tdata.imgSwap = swapData;
            if (tdata.imgSwap.doSwapFront) {
                tdata.imgSwap.frontBag = this.prepBag(tdata.imgSwap.frontBag, tdata.frontImages, tdata.imgSwap.prevFrontIndex);
                tdata.imgSwap.frontStaticRndm = tdata.imgSwap.frontBag.pop();
                if (tdata.preloadImages)
                    $(tdata.frontImages).metrojs.preloadImages(function () { });
            }
            if (tdata.imgSwap.doSwapBack) {
                tdata.imgSwap.backBag = this.prepBag(tdata.imgSwap.backBag, tdata.backImages, tdata.imgSwap.prevBackIndex);
                tdata.imgSwap.backStaticRndm = tdata.imgSwap.backBag.pop();
                if (tdata.preloadImages)
                    $(tdata.backImages).metrojs.preloadImages(function () { });
            }
        },
        prepBag: function (bag, content, prevIdx) {
            bag = [];
            var bagCount = 0;
            for (var i = 0; i < content.length; i++) {
                //make sure there's not an immediate repeat
                if (i != prevIdx || content.length === 1) {
                    bag[bagCount] = i;
                    bagCount++;
                }
            }
            return helperMethods.shuffleArray(bag);
        },
        getFrontSwapIndex: function (tdata) {
            var idx = 0;
            if (!tdata.imgSwap.frontIsRandom) {
                idx = tdata.imgSwap.frontIsInGrid ? tdata.imgSwap.frontStaticIndex : tdata.imgSwap.frontIndex;
            } else {
                if (tdata.imgSwap.frontBag.length === 0) {
                    tdata.imgSwap.frontBag = this.prepBag(tdata.imgSwap.frontBag, tdata.frontImages, tdata.imgSwap.prevFrontIndex);
                }
                if (tdata.imgSwap.frontIsInGrid) {
                    idx = tdata.imgSwap.frontStaticRndm;
                } else {
                    idx = tdata.imgSwap.frontBag.pop();
                }
            }
            return idx;
        },
        getBackSwapIndex: function (tdata) {
            var idx = 0;
            if (!tdata.imgSwap.backIsRandom) {
                idx = tdata.imgSwap.backIsInGrid ? tdata.imgSwap.backStaticIndex : tdata.imgSwap.backIndex;
            } else {
                if (tdata.imgSwap.backBag.length === 0) {
                    tdata.imgSwap.backBag = this.prepBag(tdata.imgSwap.backBag, tdata.backImages, tdata.imgSwap.prevBackIndex);
                }
                if (tdata.imgSwap.backIsInGrid) {
                    idx = tdata.imgSwap.backStaticRndm;
                } else {
                    idx = tdata.imgSwap.backBag.pop();
                }
            }
            return idx;
        },
        setImageProperties: function ($img, image, isBackground) {
            var css = {}, // css object to apply
                attr = {}; // attribute values to apply
            // get image source
            if (typeof (image.src) !== 'undefined') {
                if (!isBackground)
                    attr.src = image.src;
                else
                    css.backgroundImage = "url('" + image.src + "')";
            }
            // get alt text
            if (typeof (image.alt) !== 'undefined')
                attr.alt = image.alt;
            // set css
            if (typeof (image.css) === 'object')
                $img.css($.extend(css, image.css));
            else
                $img.css(css);
            // set attributes
            if (typeof (image.attr) === 'object')
                $img.attr($.extend(attr, image.attr));
            else
                $img.attr(attr);
        },
        action: function (tdata, $front, $back, index) {
            if (!tdata.imgSwap.doSwapFront && !tdata.imgSwap.doSwapBack)
                return;
            var isList = tdata.mode === "flip-list";
            var swapIndex = 0;
            var isReversed = isList ? tdata.listData[Math.max(index, 0)].isReversed : tdata.isReversed;
            if (isList && index == -1) {
                // flip list completed
                if (!isReversed) {
                    if (tdata.imgSwap.doSwapFront) {
                        // update the random value for grid mode
                        if (tdata.imgSwap.frontBag.length === 0)
                            tdata.imgSwap.frontBag = this.prepBag(tdata.imgSwap.frontBag, tdata.frontImages, tdata.imgSwap.frontStaticRndm);
                        tdata.imgSwap.frontStaticRndm = tdata.imgSwap.frontBag.pop();
                        // update the static index
                        tdata.imgSwap.frontStaticIndex++;
                        if (tdata.imgSwap.frontStaticIndex >= tdata.frontImages.length)
                            tdata.imgSwap.frontStaticIndex = 0;
                    }
                } else {
                    if (tdata.imgSwap.doSwapBack) {
                        // update the random value for grid mode
                        if (tdata.imgSwap.backBag.length === 0)
                            tdata.imgSwap.backBag = this.prepBag(tdata.imgSwap.backBag, tdata.backImages, tdata.imgSwap.backStaticRndm);
                        tdata.imgSwap.backStaticRndm = tdata.imgSwap.backBag.pop();
                        // update the static index
                        tdata.imgSwap.backStaticIndex++;
                        if (tdata.imgSwap.backStaticIndex >= tdata.backImages.length)
                            tdata.imgSwap.backStaticIndex = 0;
                    }
                }
                return;
            }
            var $face, // face being swapped
                $img, // image to apply values
                image; // image object to hold properties
            if (!isReversed) {
                if (!tdata.imgSwap.doSwapFront)
                    return;
                swapIndex = this.getFrontSwapIndex(tdata);
                tdata.imgSwap.prevFrontIndex = swapIndex;
                // slide mode has a static front and back face
                $face = (tdata.mode === "slide") ? $front : $back;
                $img = $face.find(tdata.imgSwap.imageCssSelector);
                image = typeof (tdata.frontImages[swapIndex]) === "object" ? tdata.frontImages[swapIndex] : { src: tdata.frontImages[swapIndex] };
                // set src, alt, css and attribute values
                this.setImageProperties($img, image, tdata.imgSwap.frontIsBackgroundImage);
                // increment indexes
                tdata.imgSwap.frontIndex++;
                if (tdata.imgSwap.frontIndex >= tdata.frontImages.length)
                    tdata.imgSwap.frontIndex = 0;
                if (!isList) {
                    tdata.imgSwap.frontStaticIndex++;
                    if (tdata.imgSwap.frontStaticIndex >= tdata.frontImages.length)
                        tdata.imgSwap.frontStaticIndex = 0;
                } else {

                }
            } else {
                if (!tdata.imgSwap.doSwapBack)
                    return;
                // get the new index
                swapIndex = this.getBackSwapIndex(tdata);
                tdata.imgSwap.prevBackIndex = swapIndex;
                // use the $face var for consistency
                $face = $back;
                $img = $face.find(tdata.imgSwap.imageCssSelector);
                image = typeof (tdata.backImages[swapIndex]) === "object" ? tdata.backImages[swapIndex] : { src: tdata.backImages[swapIndex] };
                // set src, alt, css and attribute values
                this.setImageProperties($img, image, tdata.imgSwap.backIsBackgroundImage);
                // increment indexes
                tdata.imgSwap.backIndex++;
                if (tdata.imgSwap.backIndex >= tdata.backImages.length)
                    tdata.imgSwap.backIndex = 0;
                if (!isList) {
                    tdata.imgSwap.backStaticIndex++;
                    if (tdata.imgSwap.backStaticIndex >= tdata.backImages.length)
                        tdata.imgSwap.backStaticIndex = 0;
                } else {

                }
            }
            $face = null;
            $img = null;

        }
    }
};

// object to maintain timer state
$.fn.metrojs.TileTimer = function (interval, callback, repeatCount) {
    this.timerId = null;                                                        // the id of the current timeout
    this.interval = interval;                                                   // the amount of time to wait between each action call
    this.action = callback;                                                     // the method that is fired on each tick
    this.count = 0;                                                             // the number of times the action has been fired
    this.repeatCount = typeof (repeatCount) === "undefined" ? 0 : repeatCount;   // the number of times the action will be fired        
    // call the action method after a delay and call start | stop based on repeat count
    this.start = function (delay) {
        window.clearTimeout(this.timerId);
        var t = this;
        this.timerId = window.setTimeout(function () {
            t.tick.call(t, interval);
        }, delay);
    };

    this.tick = function (interval) {
        this.action(this.count + 1);
        this.count++;
        // reset the loop count
        if (this.count >= MAX_LOOP_COUNT)
            this.count = 0;
        if (this.repeatCount > 0 || this.repeatCount == -1) {
            if (this.count != this.repeatCount) {
                this.start(interval);
            } else
                this.stop();
        }
    }
    // clear the timer and reset the count
    this.stop = function () {
        this.timerId = window.clearTimeout(this.timerId);
        this.reset();
    };

    this.resume = function () {
        if (this.repeatCount > 0 || this.repeatCount == -1) {
            if (this.count != this.repeatCount) {
                this.start(interval);                
            }
        }
    };

    // clear the timer but leave the count intact
    this.pause = function () {
        this.timerId = window.clearTimeout(this.timerId);
    };

    // reset count
    this.reset = function () {
        this.count = 0;
    };

    // reset count and timer
    this.restart = function (delay) {
        this.stop();
        this.start(delay);
    };
};
///#source 1 1 /Scripts/MetroJs/src/js/fin.js
/* Preload Images */
// Usage: jQuery(['img1.jpg','img2.jpg']).metrojs.preloadImages(function(){ ... });
// Callback function gets called after all images are preloaded
jQuery.fn.metrojs.preloadImages = function (callback) {
    var checklist = jQuery(this).toArray();
    var $img = jQuery("<img style='display:none;' />").appendTo("body");
    jQuery(this).each(function () {
        $img.attr({ src: this }).load(function () {
            var src = jQuery(this).attr('src');
            for (var i = 0; i < checklist.length; i++) {
                if (checklist[i] == element) { checklist.splice(i, 1); }
            }
            if (checklist.length == 0) { callback(); }
        });
    });
    $img.remove();
};
// object used for compatibility checks
$.fn.metrojs.MetroModernizr = function (stgs) {
    if(typeof(stgs) === "undefined"){
        stgs = { useHardwareAccel: true, useModernizr: typeof(window.Modernizr) !== "undefined"  }
    }
    this.isOldJQuery =  /^1\.[0123]/.test(jQuery.fn.jquery),
    this.canTransform = false;
    this.canTransition = false;
    this.canTransform3d = false;
    this.canAnimate = false;
    this.canTouch = false;
    this.canFlip3d = stgs.useHardwareAccel;
    if (stgs.useHardwareAccel == true) {
        if (stgs.useModernizr == false) {
            //determine if the browser supports the neccessary accelerated features
            if (typeof (window.MetroModernizr) !== "undefined") {
                this.canTransform = window.MetroModernizr.canTransform;
                this.canTransition = window.MetroModernizr.canTransition;
                this.canTransform3d = window.MetroModernizr.canTransform3d;
                this.canAnimate = window.MetroModernizr.canAnimate;
                this.canTouch = window.MetroModernizr.canTouch;
            } else {
                window.MetroModernizr = {};
                /***** check for browser capabilities credit: modernizr-1.7 http://modernizr.com/ *****/
                var mod = 'metromodernizr';
                var docElement = document.documentElement;
                var docHead = document.head || document.getElementsByTagName('head')[0];
                var modElem = document.createElement(mod);
                var m_style = modElem.style;
                var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
                var domPrefixes = 'Webkit Moz O ms Khtml'.split(' ');
                var test_props = function (props, callback) {
                    for (var i in props) {
                        if (m_style[props[i]] !== undefined && (!callback || callback(props[i], modElem))) {
                            return true;
                        }
                    }
                };
                var test_props_all = function (prop, callback) {
                    var uc_prop = prop.charAt(0).toUpperCase() + prop.substr(1),
                    props = (prop + ' ' + domPrefixes.join(uc_prop + ' ') + uc_prop).split(' ');
                    return !!test_props(props, callback);
                };
                var test_3d = function () {
                    var ret = !!test_props(['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']);
                    if (ret && 'webkitPerspective' in docElement.style) {
                        // Webkit allows this media query to succeed only if the feature is enabled.
                        // '@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-ms-transform-3d),(-webkit-transform-3d),(modernizr){ ... }'
                        ret = testMediaQuery(['@media (',prefixes.join('transform-3d),('),mod,')','{#metromodernizr{left:9px;position:absolute;height:3px;}}'].join(''), function(div){
                            return div.offsetHeight === 3 && div.offsetLeft === 9;
                        });
                    }
                    return ret;
                };
                var testMediaQuery = function (mq, predicate) {
                    var st = document.createElement('style'),
                        div = document.createElement('div'),
                        ret;
                    st.textContent = mq;
                    docHead.appendChild(st);
                    div.id = mod;
                    docElement.appendChild(div);
                    ret = predicate(div);
                    st.parentNode.removeChild(st);
                    div.parentNode.removeChild(div);
                    return !!ret;
                };
                var test_touch = function() {
                    return canTouch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch || 
                        (typeof(window.navigator.msMaxTouchPoints) !== "undefined" && window.navigator.msMaxTouchPoints > 0) || 
                        testMediaQuery(['@media (',prefixes.join('touch-enabled),('),mod,')','{#metromodernizr{top:9px;position:absolute}}'].join(''), function(div){
                            return div.offsetTop === 9;
                        }); 
                };
                this.canTransform = !!test_props(['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform']);
                this.canTransition = test_props_all('transitionProperty');
                this.canTransform3d = test_3d();
                this.canAnimate = test_props_all('animationName');
                this.canTouch = test_touch();
                window.MetroModernizr.canTransform = this.canTransform;
                window.MetroModernizr.canTransition = this.canTransition;
                window.MetroModernizr.canTransform3d = this.canTransform3d;
                window.MetroModernizr.canAnimate = this.canAnimate;
                window.MetroModernizr.canTouch = this.canTouch;
                docElement = null;
                docHead = null;
                modElem = null;
                m_style = null;
            }
        } else {
            this.canTransform = $("html").hasClass("csstransforms");
            this.canTransition = $("html").hasClass("csstransitions");
            this.canTransform3d = $("html").hasClass("csstransforms3d");
            this.canAnimate = $("html").hasClass("cssanimations");
            this.canTouch = $("html").hasClass("touch") || (typeof(window.navigator.msMaxTouchPoints) !== "undefined" && window.navigator.msMaxTouchPoints > 0);
        }
    }
    this.canFlip3d = this.canFlip3d && this.canAnimate && this.canTransform && this.canTransform3d;
};

})(jQuery);
