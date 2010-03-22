
// === Silverlight Audio ===
// depend: uu, uu.audio

//  <audio>
//      <object>
//          <Canvas>
//              <MediaElement Source="example.mp3" AutoPlay="true" />
//          </Canvas>
//      </object>
//  </audio>

uu.agein || (function(win, doc, uu) {

uu.audio.Silverlight.init = init;
uu.audio.Silverlight.build = build;

// uu.audio.Silverlight.init
function init(ctx, audio) { // @param Node: <audio>
    ctx._autoplay       = audio.getAttribute("autoplay") ? true : false;
    ctx._loop           = audio.getAttribute("loop") === "true" ? true : false;
    ctx._src            = audio.getAttribute("src") || "";
    ctx._error          = null;     // [READ-ONLY]
    ctx._ended          = false;    // [READ-ONLY]
    ctx._paused         = false;    // [READ-ONLY]
    ctx._volume         = 1;        // 0.0~1.0
    ctx._startTime      = 0;

    // audio.method
    audio.play = function() {
        ctx._lastUserAction = "play";
        ctx._state ? ctx._media.play()
                   : ctx._stock.push("play", 0);
    };
    audio.pause = function() {
        ctx._lastUserAction = "pause";
        ctx._state ? ctx._media.pause()
                   : ctx._stock.push("pause", 0);
    };
    audio.stop = function() {
        ctx._lastUserAction = "stop";
        ctx._state ? ctx._media.stop()
                   : ctx._stock.push("stop", 0);
    };
    audio.load = function() {
        ctx._lastUserAction = "load";
        if (ctx._state) {
            if (ctx._lastMediaState === "Playing") {
                ctx._media.stop()
            }
        } else {
            ctx._stock.push("load", 0);
        }
    };
    audio.getCurrentTime = function() {
        return ctx._media ? (ctx._media.Position.Seconds | 0) : 0;
    };

    ctx._media          = null;     // <MediaElement>
    ctx._view           = null;     // <Canvas>
    ctx._content        = null;     // <object>
    ctx._state          = 0;        // 0x0: not ready
    ctx._stock          = [];       // lock stock
                                    // 0x1: play ready(normal)
    ctx._lastUserAction = "";       // last User Action
    ctx._lastMediaState = "Paused"; // last MediaElement.CurrentStateChanged

    if (uu.ie) {
        audio.autoplay      = ctx._autoplay;
        audio.loop          = ctx._loop;
        audio.src           = ctx._src;
        audio.error         = ctx._error;
        audio.ended         = ctx._ended;
        audio.paused        = ctx._paused;
        audio.volume        = ctx._volume;
        audio.startTime     = ctx._startTime;
        audio.currentTime   = 0;
    }
}

// uu.audio.Silverlight.build
function build(audio) { // @param Node: <audio>
                        // @return Node:
    var ctx,
        ERROR_OR_CLOSED = /^(Closed|Error)$/,
        commandQueueTimer = 0,
        // [ASYNC] initialized notify callback handler
        onload = "uuAudioSilverlightOnLoad" + uu.guid(),
        watchAttrs = {
            autoplay:       1,
            loop:           1,
            src:            1,
            volume:         1,
            startTime:      1,
            currentTime:    1
        };

    ctx = new uu.audio.Silverlight(audio);

    // wait for response from Silverlight initializer
    win[onload] = function(sender) { // @param Node: sender is <Canvas> node
        ctx._view = sender.children;
        ctx._content = sender.getHost().content; // getHost() -> <object>

        ctx._view.add(ctx._content.createFromXaml(
            '<Canvas xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">' +
                uu.fmt('<MediaElement x:Name="media" Source="?" Volume="?" />',
                       [ctx._src, ctx._volume]) +
            '</Canvas>'));

        ctx._media = sender.findName("media");

        // trap Media Error
        ctx._media.AddEventListener("MediaFailed", function() {
            setErrorState(ctx, audio, ctx._media.CurrentState);
            uu.ev.fire(audio, "error"); // open failed
        });

        ctx._media.AddEventListener("MediaOpened", function() {
            uu.ev.fire(audio, "canplay");
        });

        // trap Change State
        ctx._media.AddEventListener("CurrentStateChanged", function() {
//          uu.trace("CurrentStateChanged", ctx._media.CurrentState);

            // ignore consecutive events
            if (ctx._lastMediaState === ctx._media.CurrentState) {
                return;
            }
            // trap "Closed" or "Error"
            if (ERROR_OR_CLOSED.test(ctx._lastMediaState)
                && ERROR_OR_CLOSED.test(ctx._media.CurrentState)) {
                return;
            }

            ctx._lastMediaState = ctx._media.CurrentState; // update last state

            switch (ctx._media.CurrentState) {
            case "Buffering":
            case "Opening":
                break;
            // audio.play(none supported file) -> "Error"
            // audio.play(file not found)      -> "Closed"
            // audio.load -> "Error"
            case "Error":
            case "Closed":
                setErrorState(ctx, audio, ctx._media.CurrentState);
                uu.ev.fire(audio, "error");
                break;
            // audio.pause -> MediaState("Paused") -> uuevfire("pause")
            // audio.stop  -> MediaState("Paused") -> uuevfire("ended")
            // file end    -> MediaState("Paused") -> uuevfire("ended")
            case "Paused":
                if (ctx._lastUserAction === "pause") {
                    setPausedState(ctx, audio);
                    uu.ev.fire(audio, "pause");
                } else {
                    if (ctx._loop) {
                        setEndedState(ctx, audio);
                        uu.ev.fire(audio, "ended"); // ???
                    } else {
                        setEndedState(ctx, audio);
                        uu.ev.fire(audio, "ended");
                        setPosition(ctx)
                    }
                }
                break;
            // audio.play -> "Playing"
            case "Playing":
                setPlayingState(ctx, audio);
                uu.ev.fire(audio, "playing");
                break;
            case "Stopped":
                uu.trace("Stopped");
                break;
            }
        });

        // audio.loop
        if (ctx._loop) {
            ctx._media.AddEventListener("MediaEnded",
                                        "uuAudioSilverlightOnMediaEnded");
        }

        ctx._state = 0x1; // play ready(locked flag off)

        if (ctx._stock.length) {
            if (!commandQueueTimer) {
                commandQueueTimer = setTimeout(commandQueue, 0);
            }
        }
    };

    // create Silverlight <object>
    audio.innerHTML = [
        '<object type="application/x-silverlight-2" width="1" height="1">',
            '<param name="background" value="#00000000" />',  // transparent
            '<param name="windowless" value="true" />',
            '<param name="source" value="#xaml" />',          // XAML ID
            '<param name="onLoad" value="', onload, '" />',   // bond to global
        '</object>'].join("");

    function commandQueue() {
        if (!ctx._state) {
            commandQueueTimer = setTimeout(commandQueue, 100);
            return;
        }
        commandQueueTimer = 0;

        var ary = ctx._stock, i = 0, iz = ary.length, command, arg;

        while (i < iz) {
            command = ary[i++];
            arg = ary[i++];

            switch (command) {
            case "load":        ctx._lastMediaState === "Playing" &&
                                ctx._media.stop();  break;
            case "pause":       ctx._media.pause(); break;
            case "play":        ctx._media.play();  break;
            case "stop":        ctx._media.stop();  break;
            case "currentTime": ctx._currentTime = arg;
                                setPosition(ctx); break;
            case "volume":      ctx._media.Volume = arg; break;
            case "loop":
                arg ? ctx._media.AddEventListener("MediaEnded",
                                                  "uuAudioSilverlightOnMediaEnded")
                    : ctx._media.RemoveEventListener("MediaEnded",
                                                     "uuAudioSilverlightOnMediaEnded");
                break;
            case "src":
                resetState(ctx, audio);
                ctx._media.stop();
                ctx._media.Source = arg;
                setPosition(ctx);
                if (ctx._autoplay) {
                    ctx._media.play();
                }
            }
        }
        ctx._stock = [];
    }

    // media.loop implement
    win.uuAudioSilverlightOnMediaEnded = function(sender) {
        setPosition(ctx);
        sender.play();
    };

    // attach mutation events
    if (uu.ie678) {
        audio.attachEvent("onpropertychange", onPropertyChange);
    }

    // trap audio.attr modified event
    function onPropertyChange(evt) {
        var attr = evt.propertyName;

        if (watchAttrs[attr]) {
            ctx._stock.push(attr, audio[attr]);
            if (!commandQueueTimer) {
                commandQueueTimer = setTimeout(commandQueue, 0);
            }
        }
    }

    if (!uu.ie) {
        audio.__defineGetter__("autoplay", function() {
            return ctx._autoplay;
        });
        audio.__defineGetter__("loop", function() {
            return ctx._loop;
        });
        audio.__defineGetter__("src", function() {
            return ctx._src;
        });
        audio.__defineGetter__("volume", function() {
            return parseFloat(ctx._volume.toFixed(3));
        });
        audio.__defineGetter__("startTime", function() {
            return ctx._startTime;
        });
        audio.__defineGetter__("currentTime", function() {
            return ctx._media ? (ctx._media.Position.Seconds | 0) : 0;
        });
        audio.__defineGetter__("paused", function() {
            return ctx._paused;
        });
        audio.__defineGetter__("ended", function() {
            return ctx._ended;
        });
        audio.__defineGetter__("error", function() {
            return ctx._error;
        });

        audio.__defineSetter__("autoplay", function(v) {
            ctx._autoplay = v ? true : false;
        });
        audio.__defineSetter__("loop", function(v) {
            ctx._loop = v ? true : false;
            ctx._stock.push("loop", v);
            if (!commandQueueTimer) {
                commandQueueTimer = setTimeout(commandQueue, 0);
            }
        });
        audio.__defineSetter__("src", function(v) {
            ctx._src = v;
            ctx._stock.push("src", v);
            if (!commandQueueTimer) {
                commandQueueTimer = setTimeout(commandQueue, 0);
            }
        });
        audio.__defineSetter__("volume", function(v) {
            ctx._volume = v;
            ctx._stock.push("volume", v);
            if (!commandQueueTimer) {
                commandQueueTimer = setTimeout(commandQueue, 0);
            }
        });
        audio.__defineSetter__("startTime", function(v) {
            ctx._startTime = v;
        });
        audio.__defineSetter__("currentTime", function(v) {
            ctx._stock.push("currentTime", v);
            if (!commandQueueTimer) {
                commandQueueTimer = setTimeout(commandQueue, 0);
            }
        });
    }

    // fixed memory leak
    uu.ie678 && win.attachEvent("onunload", function() {
        win.detachEvent("onunload", arguments.callee);
        audio.detachEvent("onpropertychange", onPropertyChange);
        win[onload] = null;
    });

    return audio;
}

// inner -
function setErrorState(ctx, audio, currentState) {
    uu.trace(currentState);

    ctx._error = { code: 4 }; // 4: MEDIA_ERR_NONE_SUPPORTED
    ctx._ended = true;
    ctx._paused = false;
    if (uu.ie) {
        audio.error = ctx._error;
        audio.ended = ctx._ended;
        audio.paused = ctx._paused;
    }
}

// inner -
function setPausedState(ctx, audio) {
    uu.trace("Paused");

    ctx._ended = false;
    ctx._paused = true;
    if (uu.ie) {
        audio.ended = ctx._ended;
        audio.paused = ctx._paused;
    }
}

// inner -
function setEndedState(ctx, audio) {
    uu.trace("Ended");

    ctx._ended = true;
    ctx._paused = false;
    if (uu.ie) {
        audio.ended = ctx._ended;
        audio.paused = ctx._paused;
    }
}

// inner -
function setPlayingState(ctx, audio) {
    uu.trace("Playing");

    ctx._error = null;
    ctx._ended = false;
    ctx._paused = false;
    if (uu.ie) {
        audio.error = ctx._error;
        audio.ended = ctx._ended;
        audio.paused = ctx._paused;
    }
}

// inner -
function resetState(ctx, audio) {
    ctx._error = null;
    ctx._ended = false;
    ctx._paused = false;
    if (uu.ie) {
        audio.error = ctx._error;
        audio.ended = ctx._ended;
        audio.paused = ctx._paused;
    }
}

// inner - avoid Silverlight strange spec
function setPosition(ctx) {
    var position = ctx._media.Position; // [!] create instance

    position.Seconds = ctx._startTime; // set time

    ctx._media.Position = position; // [!] reattach instance
}

// add inline XAML source
uu.ver.silverlight && uu.lazy("init", function() {
    uu.id("xaml") || doc.head.appendChild(uu.mix(uue("script"), {
            id:   "xaml",
            type: "text/xaml",
            text: '<Canvas xmlns="http://schemas.microsoft.com/client/2007" ' +
                          'xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"></Canvas>'
    }));
}, 2); // 2: high order

})(window, document, uu);

