//TypingTest application begin
function TypingTest(e, settings) {
    if (!e) {
        return false;
    } else {
        var t = this; //define the context

        //global text resources begin
        t.TEXT_RESOURCES = {  
            SELECT_TEXT: {
                en: "Select text"
            },
            FLUSH: {
                en: "Reset (the same as if you press F5)"
            },
            TYPING_INFO: {
                en: "Start typing to begin your session, or press 'Start' button on the panel below."
            },
            TIME_LIMIT_INFO: {
                en: "If you want to, you can set a time limit for your <br />Typing Test session for each text samples"
            },
            TIME_LIMIT_LABEL: {
                en: "Time limit: "
            },
            RESULT: {
                en: "Your result:"
            },
            TOTAL_TIME: {
                en: "Total time, that you spent for typing: "
            },
            TOTAL_HITS: {
                en: "Total hits: "
            },
            CORRECT_HITS: {
                en: "Correct hits: "
            },
            INCORRECT_HITS: {
                en: "Incorrect hits: "
            },
            CORRECT_HITS_PER_MINUTES: {
                en: "Correct hits per minute: ~"
            },
            TYPING_QUALITY: {
                en: "Your typing quality: ~"
            },
            NOT_A_SINGLE_HIT: {
                en: "<div style='width: 100%; text-align: center; font-weight: bold; font-size: 72px;'>-_-</div> <br />Common, you don't even have to try!"
            }
        };
        //global text resources end

        //global settings begin
        t.settings = {  
            renderTarget: settings.renderTarget || "body",
            globalLanguage: settings.globalLanguage || "en",
            textResources: settings.textResources || false,
            beforeInit: $.noop,
            afterInit: $.noop
        };
        //global settings end

        //showStat method begin
        t.showStat = function () {
            //if the user makes at least one single hit on the keyboard
            if (t.totalKeyHits) {
                //preparing the data for statistics
                //letters per minutes
                var lettersPerMinute = Math.round(t.correctKeyHits / t.uiVisualTimer.getSeconds() * 60);

                //quality of the user's typing 
                var quality = Math.round(t.correctKeyHits / t.totalKeyHits * 100);

                //preparing the HTML with the statistics
                var $statBlockHTML = $(
                    "<div class='stat-container'>" +
                    "   <span>" + t.TEXT_RESOURCES.TOTAL_TIME[t.settings.globalLanguage] + t.uiVisualTimer.getData() + "</span><br />" +
                    "   <span>" + t.TEXT_RESOURCES.TOTAL_HITS[t.settings.globalLanguage] + t.totalKeyHits + "</span><br />" +
                    "   <span>" + t.TEXT_RESOURCES.CORRECT_HITS[t.settings.globalLanguage] + t.correctKeyHits + "</span><br />" +
                    "   <span>" + t.TEXT_RESOURCES.INCORRECT_HITS[t.settings.globalLanguage] + t.wrongKeyHits + "</span><br />" +
                    "   <hr />" +
                    "   <span>" + t.TEXT_RESOURCES.CORRECT_HITS_PER_MINUTES[t.settings.globalLanguage] + lettersPerMinute + "</span><br />" +
                    "   <span>" + t.TEXT_RESOURCES.TYPING_QUALITY[t.settings.globalLanguage] + quality + "%</span><br />" +
                    "</div>"
                );

                //show the modal window with the statistics of the user's typing
                t.uiShowStatModalWindow.showModalWindow({
                    title: t.TEXT_RESOURCES.RESULT[t.settings.globalLanguage],
                    mainContentHTML: $statBlockHTML
                });
            } else { //if no hit has been detected
                //show the modal window with the information about that 
                //the user does not make a single hit on the keyboard
                t.uiShowStatModalWindow.showModalWindow({
                    title: t.TEXT_RESOURCES.RESULT[t.settings.globalLanguage],
                    mainContentHTML: t.TEXT_RESOURCES.NOT_A_SINGLE_HIT[t.settings.globalLanguage]
                });
            }
        };
        //showStat method begin

        //reInit method begin
        t.reInit = function () {
            t.pos = 0; //reset the input position
            t.typingSessionIsActive = false; //reset the session status
            t.uiVisualTimer.Stop(true); //reset the timer
            t.currentDuration = false; //reset the time limit
            t.totalKeyHits = 0; //reset counter for the total hits 
            t.correctKeyHits = 0; //reset the counter for correct hits 
            t.wrongKeyHits = 0; // reset the counter for incorrect hits

            //reset the user's input
            if (t.$letters) {
                t.$letters.removeClass("wrong-hit").removeClass("correct-hit").removeClass("pressed-button");
            }
        };
        //reInit method end

        //textFormatter method begin
        t.textFormatter = function () {
            if (t.SELECTED_TEXT.length) { //if the user selected any text from the list
                var formatStrHTML = "";

                //wrap each letter in the text (including the space bar) into <span> container,
                //with classes .letter and .no-press-yet
                for (var i = 0; i < t.SELECTED_TEXT.length; i++) {
                    formatStrHTML += "<span class='letter no-press-yet'>" + t.SELECTED_TEXT[i] + "</span>";
                }

                return formatStrHTML; //return the formatted string
            }

            return false; //if the text was not selected then return false
        };
        //textFormatter method end
       
        //render method begin
        t.render = function () { 
            $(t.settings.renderTarget).append(t.$tpl);

            //prepare HTML template for texts list item
            t.textsList = "<span class='italic' style='font-size: 14px;'>" + t.TEXT_RESOURCES.TIME_LIMIT_INFO[t.settings.globalLanguage] + "</span><br />";
            $.each(t.settings.textResources, function (key, value) {
                t.textsList +=
                    "<div class='menu-item-wrapper' id='" + key + "'>" +
                    "   <div class='lock locked-menu-item'></div>" +
                    "   <span class='menu-item' data-key='" + key + "'>" + (this.title || "untitled") + "</span>" +
                    "   <span class='label italic'>" + t.TEXT_RESOURCES.TIME_LIMIT_LABEL[t.settings.globalLanguage] + "</span>" +
                    "</div>";
            });

            //preferences for uiSelectTextModalWindow modal window
            var textsListPrefs = {
                title: t.TEXT_RESOURCES.SELECT_TEXT[t.settings.globalLanguage],
                mainContentHTML: t.textsList
            };

            //showing uiSelectTextModalWindow modal window
            t.uiSelectTextModalWindow.showModalWindow(textsListPrefs);

            t.$tpl.find(".select-text-btn").click(function () {
                t.uiSelectTextModalWindow.showModalWindow(textsListPrefs);
            });
        };
        //render method end

        //init method begin
        t.init = function () {
            if (t.settings.beforeInit instanceof Function) { 
                t.settings.beforeInit.apply(t); //before init user's callback
            }

            //user's input position in the text
            t.pos = 0;

            //main HTML template begin
            t.$tpl = $(
                    "<div class='typing-container'>" +
                    "   <div class='control-panel'>" +
                    "       <span class='select-text-btn float-left'>" + t.TEXT_RESOURCES.SELECT_TEXT[t.settings.globalLanguage] + "</span>" +
                    "       <span class='flush-btn float-right'>" + t.TEXT_RESOURCES.FLUSH[t.settings.globalLanguage] + "</span>" +
                    "       <div class='select-text-block'></div>" +
                    "   </div>" +
                    "   <div class='info'>" + t.TEXT_RESOURCES.TYPING_INFO[t.settings.globalLanguage] + "</div>" +
                    "   <div class='main-text-block'></div>" +
                    "   <div class='workspace'></div>" +
                    "</div>"
                    );
            //main HTML template end

            //reloading the page
            t.$tpl.find(".flush-btn").click(function () { window.location = './index.html'; });

            //the map of TimePicker controls
            t.uiTimePickers = {};

            //uiSelectTextModalWindow init begin
            t.uiSelectTextModalWindow = new Controls.ModalWindow({
                beforeShow: function () {
                    //if modal window is open - pausing this session 
                    t.uiVisualTimer.Pause();

                    //define the status of the modal window
                    //it also lock the screen for the input from the keyboard
                    t.overlayIsDisplay = true;
                },
                afterShow: function () {
                    //define the jQuery collection of the DOM nodes which have class menu-item
                    var $menuItem = $("body").find(".menu-item");

                    //for each menu item
                    $.each($menuItem, function () {
                        var $t = $(this);
                        var renderTarget = $t.filter(".menu-item-wrapper");
                        
                        //create a particular instance of TimePicker control
                        t.uiTimePickers[$t.data("key")] = new Controls.TimePicker({
                            renderTarget: "#" + $t.data("key"),
                            onValid: function () {
                                $("#" + $t.data("key") + " div.lock").hide();
                            },
                            onInvalid: function () {
                                $("#" + $t.data("key") + " div.lock").show();
                            }
                        });
                    });

                    //event handler of the click on the menu item
                    $menuItem.click(function () {
                        var $t = $(this); //define a jQure object of the current context

                        //copy the particular text into the global environment variable
                        t.SELECTED_TEXT = t.settings.textResources[$t.data("key")].text;

                        //insert the formatted text into the container which has the class, .main-text-block
                        t.$tpl.find(".main-text-block").html(t.textFormatter());

                        //collect each letter of the selected text
                        t.$letters = t.$tpl.find(".letter");

                        //set the time limit for current session
                        t.currentDuration = t.uiTimePickers[$t.data("key")].getData();
                        t.uiVisualTimer.setData({ duration: t.currentDuration });

                        //show the informer
                        t.$tpl.find(".info").show();

                        //reset the required variables
                        t.reInit();

                        //show the timer
                        t.$tpl.find(".timer").show();

                        //close the modal window after the text is selected
                        t.uiSelectTextModalWindow.hideModalWindow();
                    });
                },
                afterHide: function () {
                    //change the status of the modal window
                    //it also released the input from the keyboard
                    t.overlayIsDisplay = false;
                }
            });
            //uiSelectTextModalWindow init end

            //uiShowStatModalWindow init begin
            t.uiShowStatModalWindow = new Controls.ModalWindow({
                afterShow: function () {
                    //define the status of the modal window
                    //it also lock the screen for the input from the keyboard
                    t.overlayIsDisplay = true;
                },
                afterHide: function () {
                    //change the status of the modal window
                    //it also released the input from the keyboard
                    t.overlayIsDisplay = false;

                    //stop the timer without the callback
                    t.uiVisualTimer.Stop(true);

                    //reset the inner global variables of the application 
                    t.reInit();
                }
            });
            //uiShowStatModalWindow init end

            //uiVisualTimer init begin
            t.uiVisualTimer = new Controls.VisualTimer({
                renderTarget: t.$tpl.find(".workspace"),
                onStart: function () {
                    //if start event - change the timer status in the application on 'true'
                    t.typingSessionIsActive = true;
                },
                onPause: function () {
                    //if pause event - change the timer status in the application on 'false'
                    t.typingSessionIsActive = false;
                },
                onStop: function () {
                    //when the timer is stop
                    //show statistics of the user's input
                    t.showStat();

                    //reset the inner global variables of the application 
                    t.reInit();
                }
            });
            //uiVisualTimer init end

            //user's input handler begin
            $(document).keypress(function (event) {
                //if no modal window is open, timer is start, and some text is selected
                if (!t.overlayIsDisplay && t.SELECTED_TEXT) {
                    if (!t.typingSessionIsActive) {
                        t.uiVisualTimer.Start(); //start the session of typing 
                        t.typingSessionIsActive = true; //define the session status - now it's start
                    }

                    //define the current letter of the user's input
                    var currentLetter = event.key;
                    
                    //count each user's hit on the keyboard
                    t.totalKeyHits++;
                    
                    //mark current position as already passed
                    $(t.$letters[t.pos]).addClass("pressed-button");

                    //if user's input is correct
                    if (currentLetter === t.SELECTED_TEXT[t.pos]) {
                        //mark the text as a correct
                        $(t.$letters[t.pos]).removeClass("no-press-yet").removeClass("wrong-hit").addClass("correct-hit");

                        //and moving on
                        t.pos++;

                        //count the correct input 
                        t.correctKeyHits++;
                    } else { //if user's input is incorrect
                        //mark the current letter like an incorrect, and do not go to the next letter
                        $(t.$letters[t.pos]).removeClass("no-press-yet").addClass("wrong-hit");

                        //count the incorrect input
                        t.wrongKeyHits++;
                    }

                    //if entire text is already typed
                    if (t.pos === t.SELECTED_TEXT.length) {
                        //finish the current typing session
                        t.uiVisualTimer.Stop(); 
                    }
                } 
            });
            //user's input handler end

            t.render();

            if (t.settings.afterInit instanceof Function) { 
                t.settings.afterInit.apply(t); //after init user's callback
            }

            return t;
        }();
        //init method end

        return t;
    }
}
//TypingTest application end

//when the document is ready
$(document).ready(function () {
    //texts for typing
    var TEXT_RESOURCES = {
        defaultText1: {
            title: "Appearance of Jove Empire",
            text: "Although definitely human, the Jovians often seem to the other races as though they are not, the reason being that they embraced genetic engineering as the way to solve any and all the problems which plague the human race. Over the thousands of years since, the Jovians have experimented with every kind of genetic modification their technology allowed. As their powers grew, they began to believe they were capable of anything, and this led them into increasingly more bizarre mutations of their bodies and minds, a policy rigorously backed up by strict governmental control. Jovians have a very strange appearance. They are mainly about six feet tall, and their skin is a grayish yellow, their veins clearly visible. They have also lost all hair on their bodies, their features are very softened, and their eyes are cloudy and grey, with no discernible pupils or schlerae. Their language consists of mostly vowels."
        },
        defaultText2: {
            title: "Appearance of Amarr Empire",
            text: "The largest of the empires in the world of EVE, Amarr spans 40% of the inhabited solar systems. The Amarr Emperor is the head of a ritualistic, authoritarian imperial state, and below him are the Five Heirs, the heads of the five royal families from which a new Emperor is chosen. The Emperor's authority is unquestioned and absolute, but the archaic and bureaucratic system of government makes it difficult for him to exert his rule unless directly in person. Otherwise, the Five Heirs rule in his name, dividing the huge empire between them."
        },
        shortTest: {
            title: "Just some text for Typing Test",
            text: "This is just an example of some text."
        }
    };
    //texts for typing end

    //initialization of the application
    var TT = new TypingTest(true, { 
        renderTarget: ".container", //the DOM node where the main HTML template should be inserted
        textResources: TEXT_RESOURCES //text resources for typing
    });
});