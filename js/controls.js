var Controls = {}; // the map of controls

/*
an example of the ModalWindow control initialization
var uiModalWindow = new Controls.ModalWindow({
    title: "your title",
    mainContentText: "some text without html tags",
    mainContentHTML: "<p>some text <span>with</span> HTML tags</p>",
    beforeShow: function () {  }, //your callback here
    afterShow: function () {  }, //your callback here
    beforeHide: function () {  }, //your callback here
    afterHide: function () {  } //your callback here
});

usable methods
showModalWindow(silent), //showing modal window. If calling with silent === true, beforeShow and afterShow callbacks will be ignored
hideModalWindow(silent) //hiding modal window. If calling with silent === true, beforeHide and afterHide callbacks will be ignored
*/
Controls.ModalWindow = function (data) {
    var control = this;

    control.recalcWrapper = function () {
        var HTMLContentWrapper = control.$tpl.find(".content-wrapper");
        control.$tpl.find(".content-wrapper").css({
            "opacity": 1,
            "top": ($(window).height() / 2) - (HTMLContentWrapper.outerHeight() / 2) + "px",
            "left": ($(window).width() / 2) - (HTMLContentWrapper.outerWidth() / 2) + "px"
        });
    };

    control.showModalWindow = function (data, silent) {
        if (control.settings.beforeShow && control.settings.beforeShow instanceof Function && !silent) { control.settings.beforeShow.apply(); }
        if (typeof data === "object") {
            if (data.title) {
                control.$tpl.find(".title-block").text(data.title);
            }

            if (data.mainContentText) {
                control.$tpl.find(".main-content-block").text(data.mainContentText);
            } else if (data.mainContentHTML) {
                control.$tpl.find(".main-content-block").html(data.mainContentHTML);
            }

            control.$tpl.filter(".global-overlay").show();

            control.recalcWrapper();
            $(window).resize(function () { control.recalcWrapper(); });
        }
        if (control.settings.afterShow && control.settings.afterShow instanceof Function && !silent) { control.settings.afterShow.apply(); }
    };

    control.hideModalWindow = function (silent) {
        if (control.settings.beforeHide && control.settings.beforeHide instanceof Function && !silent) { control.settings.beforeHide.apply(); }
        control.$tpl.filter(".global-overlay").hide();
        if (control.settings.afterHide && control.settings.afterHide instanceof Function && !silent) { control.settings.afterHide.apply(); }
    };

    control.render = function () {
        $("body").append(control.$tpl);

        control.$tpl.find(".close-btn").click(function () {
            control.hideModalWindow();
        });
    };

    control.init = function () {
        control.settings = {
            beforeShow: data.beforeShow,
            afterShow: data.afterShow,
            beforeHide: data.beforeHide,
            afterHide: data.afterHide
        };
        control.$tpl = $(
            "<div class='control global-overlay'>" +
            "   <div class='transparent-bg'></div>" +
            "   <div class='content-wrapper'>" +
            "       <span class='close-btn'></span>" +
            "       <div class='title-block'></div>" +
            "       <div class='main-content-block'></div>" +
            "   </div>" +
            "</div>"
        );

        control.render();
    }();

    var impl = {
        showModalWindow: control.showModalWindow,
        hideModalWindow: control.hideModalWindow
    };

    return impl;
};

/*
an example of the TimePicker control initialization
var uiTimePicker = new Controls.TimePicker({
    renderTarget: ".dom-node", //DOM node, where you want to insert this control
    placeholder: "your placeholder", //just a placeholder, for example "HH:MM:SS" or "Input time here"
    regExpPattern: /your regular expression/, //sets a pattern for checking user input 
    onValid: function () {  } //your callback here
    onInvalid: function () {  } //your callback here
});

usable methods
getData() //returns a new Date object, initialized by data entered by the user, or false
*/
Controls.TimePicker = function (data) {
    var control = this;

    control.getData = function () {
        var ret = false;
        if (control.currentTime) {
            var timeStr = control.currentTime.split(":");
            ret = new Date();
            ret.setMinutes(timeStr[0]);
            ret.setSeconds(timeStr[1]);
        }

        return ret;
    };

    control.render = function () {
        $(control.settings.renderTarget).append(control.$tpl);

        control.$tpl.find("input").bind("change keydown keyup", function (event) {
            var $t = $(this);

            if (!$t.val()) {
                control.currentTime = false;
                $t.removeClass("valid-input").removeClass("invalid-input");
                if (control.settings.onValid instanceof Function) { control.settings.onValid(); }
            } else {
                if ($t.val().length === 2 && event.keyCode !== 8) {
                    $t[0].value += ":";
                }
                if ($t.val().match(control.settings.regExpPattern)) {
                    $t.removeClass("invalid-input").addClass("valid-input");
                    control.currentTime = $t.val();
                    if (control.settings.onValid instanceof Function) { control.settings.onValid(); }
                } else {
                    $t.removeClass("valid-input").addClass("invalid-input");
                    if (control.settings.onInvalid instanceof Function) { control.settings.onInvalid(); }
                }
            }
        }).keydown(function (event) {
            var $t = $(this);

            if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
                (event.keyCode >= 35 && event.keyCode <= 40)) {
                return;
            }

            if (($t.val().length === 5 && event.keyCode !== 8) ||
                (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) &&
                (event.keyCode < 96 || event.keyCode > 105)) {
                event.preventDefault();
                return false;
            }
        });
    };

    control.init = function () {
        control.currentTime = false;

        control.settings = {
            renderTarget: data.renderTarget || "body",
            placeholder: data.placeholder || "MM:SS",
            regExpPattern: data.regExpPattern || /^([0-5][0-9]|[2][0-3]):([0-5][0-9])$/g,
            onValid: data.onValid,
            onInvalid: data.onInvalid
        };

        control.$tpl = $(
            "<div class='control time-picker'>" +
            "   <input type='text' placeholder='" + control.settings.placeholder + "'/>" +
            "</div>"
        );

        control.render();
    }();

    var impl = {
        getData: control.getData
    };

    return impl;
};

/*
an example of the VisualTimer contol initialization
var uiVisualTimer = new Controls.VisualTimer({
    renderTarget: ".dom-node", //DOM node, where you want to insert this control
    duration: new Date(), //if don't set - applying direct count, if Date - applying a countdown
    onStart: function () {  }, //your callback here
    onPause: function () {  }, //your callback here
    onStop: function () {  } //your callback here
});

usable methods
setData({key: value}) //set additional or reinitialize old settings if it necessary after initialization
getData(), //returns timer value in string format, like "MM:SS"
getSeconds(), //returns timer value in seconds in digital format
Start(silent), //starts timer. If calling with silent === true, onStart callback will be ignored
Pause(silent), //pauses timer. If calling with silent === true, onPause callback will be ignored
Stop(silent) //stops timer. If calling with silent === true, onStop callback will be ignored
*/
Controls.VisualTimer = function (data) {
    var control = this;
    var Timer;

    control.update = function (target) {
        var tmpTimer = new Date("2002-02-02 00:00:00");

        if (control.settings.duration) {
            tmpTimer.setSeconds(control.contcownCounterInSec);
            if (target === "graph") {
                control.$tpl.find(".time-left").css({ "width": control.$tpl.find(".time-left").width() - control.subtractBlockWidth + "px" });
            }
        } else {
            tmpTimer.setSeconds(control.counterInSec);
        }

        control.$tpl.find(".dig").html(control.getZero(tmpTimer.getMinutes()) + ":" + control.getZero(tmpTimer.getSeconds()));
    };

    control.reRender = function () {
        control.$tpl.find(".time-left-wrapper").remove();

        if (control.settings.duration) {
            control.$tpl.find(".mixed").append(
                "       <div class='time-left-wrapper'>" +
                "           <div class='time-left'></div> " +
                "       </div>"
            );
            control.update();

            control.informerWidth = control.$tpl.find(".time-left").width();
            control.subtractBlockWidth = control.informerWidth / control.contcownCounterInSec;
        } else {
            control.$tpl.find(".dig").html("00:00");
        }
    };

    control.getZero = function (arg) {
        if (arg < 10) {
            return "0" + arg;
        } else {
            return arg;
        }
    };

    control.setData = function (data) {
        control.settings.duration = (data.duration ? (data.duration.getTime('SS') !== 0 ? data.duration : false) : false);
        control.contcownCounterInSec = (control.settings.duration ? control.settings.duration.getMinutes() * 60 + control.settings.duration.getSeconds() : false);
        control.counterInSec = 0;
        control.reRender();
    };

    control.getData = function () {
        var ret = false;

        if (control.settings.duration) {
            var tmpTimer = new Date("2002-02-02 00:00:00");
            tmpTimer.setSeconds(control.counterInSec);
            ret = control.getZero(tmpTimer.getMinutes()) + ":" + control.getZero(tmpTimer.getSeconds());
        } else {
            ret = control.$tpl.find(".dig").text();
        }

        return ret;
    };

    control.getSeconds = function () {
        return control.counterInSec;
    };

    control.Start = function (silent) {
        if (control.settings.onStart instanceof Function && !silent) { control.settings.onStart.apply(); }
        control.isPaused = false;

        if (!control.Timer) {
            control.Timer = setInterval(function () {
                if (!control.isPaused) {
                    ++control.counterInSec;

                    if (control.settings.duration) {
                        if (!control.isPaused) { --control.contcownCounterInSec; }
                        control.update("graph");
                        if (control.contcownCounterInSec === 0) { control.Stop(); }
                    } else {
                        control.update();
                    }
                }
            }, 1000);
        }
    };

    control.Pause = function (silent) {
        if (control.settings.onPause instanceof Function && !silent) { control.settings.onPause.apply(); }
        control.isPaused = true;
    };

    control.Stop = function (silent) {
        if (control.settings.onStop instanceof Function && !silent) { control.settings.onStop.apply(); }

        clearInterval(control.Timer);
        control.Timer = false;
        control.counterInSec = 0;

        control.update();

        if (control.settings.duration) {
            control.$tpl.find(".time-left").css({ "width": "100%" });
            control.contcownCounterInSec = control.settings.duration.getMinutes() * 60 + control.settings.duration.getSeconds();
        }
    };

    control.render = function () {
        $(control.settings.renderTarget).append(control.$tpl);
        control.$tpl.find(".dig").html("00:00");

        control.$tpl.find("#start").click(function (e) {
            e.preventDefault(); control.Start();
        });

        control.$tpl.find("#pause").click(function () {
            control.Pause();
        });

        control.$tpl.find("#stop").click(function () {
            control.Stop();
        });
    };

    control.init = function () {
        control.settings = {
            duration: data.duration || false,
            renderTarget: data.renderTarget || "body",
            onStart: data.onStart || false,
            onPause: data.onPause || false,
            onStop: data.onStop || false
        };
        control.contcownCounterInSec = (control.settings.duration ? control.settings.duration.getMinutes() * 60 + control.settings.duration.getSeconds() : false);
        control.counterInSec = 0;

        control.Timer = false;
        control.isPaused = false;

        control.$tpl = $(
			"<div class='control timer shadow'>" +
            "   <div class='mixed'>" +
            "       <div class='dig'></div>" +
            "   </div>" +
            "   <div>" +
            "       <span id='start'>Start</span>" +
            "       <span id='pause'>Pause</span>" +
            "       <span id='stop'>Stop</span>" +
            "   </div>" +
            "</div>"
		);

        control.render();
    }();

    var impl = {
        setData: control.setData,
        getData: control.getData,
        getSeconds: control.getSeconds,
        Start: control.Start,
        Pause: control.Pause,
        Stop: control.Stop
    };

    return impl;
};