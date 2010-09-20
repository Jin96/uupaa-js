<?php

function addLibraryNamespacePrefix($name) {
    global $ignoreAPIHasDots;

    $ignoreAPIHasDots[] = "uu." . $name;
}

$unknownAPI = array(); // array([0] => "uu.color")
$ignoreAPIHasDots = array("uu.fx.timing.cubicBezier");
$ignoreAPIWithoutDots = array();

$coreAPI = array(
    "config", "ver", "ie", "gecko", "opera", "webkit",
    "file", "snippet", "like", "type",
    "isNumber", "isString", "isFunction",
    "arg", "mix", "each", "keys", "values", "hash",
    "array", "attr", "data", "css", "style", "unit",
    "fx", "viewport", "id", "tag", "match", "query", "klass",
    "Class", "event", "svg", "node", "nodeid",
    "html", "head", "body", "text", "fix", "trim", "split", "format",
    "json", "date", "flash", "guid", "puff", "log", "ready",
    "ui", "dmz", "nop",
    "msg", "nodeset",

    "snippet.each"
);
$HTML4API = explode(",", "a,b,br,dd,div,dl,dt,h1,h2,h3,h4,h5,h6,i,img,iframe,input,li,ol,option,p,pre,select,span,table,tbody,tr,td,th,tfoot,textarea,u,ul");
$HTML5API = explode(",", "abbr,article,aside,audio,canvas,datalist,details,eventsource,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video");
$EVENTAPI = explode(",", "mousedown,mouseup,mousemove,mousewheel,click,dblclick,keydown,keypress,keyup,change,submit,focus,blur,contextmenu" .
                         "unmousedown,unmouseup,unmousemove,unmousewheel,unclick,undblclick,unkeydown,unkeypress,unkeyup,unchange,unsubmit,unfocus,unblur,uncontextmenu");

array_walk($coreAPI,  addLibraryNamespacePrefix);
array_walk($HTML4API, addLibraryNamespacePrefix);
array_walk($HTML5API, addLibraryNamespacePrefix);
array_walk($EVENTAPI, addLibraryNamespacePrefix);

function enumAPI($js) {
    global $ignoreAPIHasDots, $ignoreAPIWithoutDots, $unknownAPI, $verbose;

    // find "uu.hoge.huga("
    if (preg_match_all('/uu\.\w+(?:\.\w+(?:\.\w+(?:\.\w+)?)?)?(?:\()/', $js, $matches)) {
        $ary = array_unique($matches[0]);

        foreach ($ary as $value) {
            // trim "("
            $value = preg_replace('/\(/', '', $value); // ))

            if (!in_array(strtolower($value), $ignoreAPIHasDots)) {

                // array("uu.hoge.huga" => "uuhogehuga")
                $ignoreAPIWithoutDots[$value] = preg_replace('/\./', '', $value);
            }
        }
    }

    // find "function uuhogehuga("
    foreach ($ignoreAPIWithoutDots as $key => $value) {
        if (!preg_match('/function ' . $value . '\(/i', $js)) { // )
            $unknownAPI[] = $key;
        }
    }

    return $js;
}

function preProcess($js,        // @param String: JavaScript source code
                    $mobile,    // @param Boolean: true is "-mb" option
                    $castoff) { // @param Array: castoff idents
                                // @return String:
/*
    // strip code block
    //
    $copiedArray = $castoff; // copy array
    if ($mobile) {
        $copiedArray[] = "mb"; // add "mb"
    }

    foreach ($copiedArray as $value) {
        // "{{{!ident ... }}}!ident" -> ""
        // one line
        $js = preg_replace('/\{\{\{\!' . $value . '(?:[^\n]*)\}\}\}\!' . $value . '/', '', $js);
        // multi line
        $js = preg_replace('/\{\{\{\!' . $value . '(?:[^\n]*)\n.*?\}\}\}\!' . $value . '/ms', '', $js);

        // "{@ident ... }@ident" -> ""
        // one line
        $js = preg_replace('/\{@' . $value . '(?:[^\n]*)\}@' . $value . '/', '', $js);
        // multi line
        $js = preg_replace('/\{@' . $value . '(?:[^\n]*)\n.*?\}@' . $value . '/ms', '', $js);
    }
 */

    // trim debugger; statement
    $js = preg_replace('/debugger;/', '', $js);

    // typeof alias
    $js = preg_replace('/uu\.?type.BOOLEAN/',      '1', $js); // uu.?type.BOOLEAN -> 1
    $js = preg_replace('/uu\.?type.NUMBER/',       '2', $js);
    $js = preg_replace('/uu\.?type.STRING/',       '3', $js);
    $js = preg_replace('/uu\.?type.FUNCTION/',     '4', $js);
    $js = preg_replace('/uu\.?type.ARRAY/',        '5', $js);
    $js = preg_replace('/uu\.?type.DATE/',         '6', $js);
    $js = preg_replace('/uu\.?type.REGEXP/',       '7', $js);
    $js = preg_replace('/uu\.?type.UNDEFINED/',    '8', $js);
    $js = preg_replace('/uu\.?type.NULL/',         '9', $js);
    $js = preg_replace('/uu\.?type.HASH/',         '10', $js);
    $js = preg_replace('/uu\.?type.NODE/',         '11', $js);
    $js = preg_replace('/uu\.?type.FAKEARRAY/',    '12', $js);

    // Event.type alias
    $js = preg_replace('/uu\.?event.codes.mousedown/',      '1', $js);
    $js = preg_replace('/uu\.?event.codes.mouseup/',        '2', $js);
    $js = preg_replace('/uu\.?event.codes.mousemove/',      '3', $js);
    $js = preg_replace('/uu\.?event.codes.mousewheel/',     '4', $js);
    $js = preg_replace('/uu\.?event.codes.touchstart/',     '0x201', $js);
    $js = preg_replace('/uu\.?event.codes.touchend/',       '0x202', $js);
    $js = preg_replace('/uu\.?event.codes.touchmove/',      '0x203', $js);
    $js = preg_replace('/uu\.?event.codes.gesturestart/',   '0x401', $js);
    $js = preg_replace('/uu\.?event.codes.gestureend/',     '0x402', $js);
    $js = preg_replace('/uu\.?event.codes.gesturechange/',  '0x403', $js);

    $js = preg_replace('/uu\.?event.codes.click/',          '10', $js);
    $js = preg_replace('/uu\.?event.codes.dblclick/',       '11', $js);
    $js = preg_replace('/uu\.?event.codes.keydown/',        '12', $js);
    $js = preg_replace('/uu\.?event.codes.keypress/',       '13', $js);
    $js = preg_replace('/uu\.?event.codes.keyup/',          '14', $js);
    $js = preg_replace('/uu\.?event.codes.mouseenter/',     '15', $js);
    $js = preg_replace('/uu\.?event.codes.mouseleave/',     '16', $js);
    $js = preg_replace('/uu\.?event.codes.mouseover/',      '17', $js);
    $js = preg_replace('/uu\.?event.codes.mouseout/',       '18', $js);
    $js = preg_replace('/uu\.?event.codes.contextmenu/',    '19', $js);
    $js = preg_replace('/uu\.?event.codes.focus/',          '20', $js);
    $js = preg_replace('/uu\.?event.codes.blur/',           '21', $js);
    $js = preg_replace('/uu\.?event.codes.resize/',         '22', $js);
    $js = preg_replace('/uu\.?event.codes.scroll/',         '23', $js);
    $js = preg_replace('/uu\.?event.codes.change/',         '24', $js);
    $js = preg_replace('/uu\.?event.codes.submit/',         '25', $js);
    $js = preg_replace('/uu\.?event.codes.online/',         '50', $js);
    $js = preg_replace('/uu\.?event.codes.offline/',        '51', $js);
    $js = preg_replace('/uu\.?event.codes.message/',        '52', $js);
//  $js = preg_replace('/uu\.?event.codes.orientationchange/', '60', $js);
    $js = preg_replace('/uu\.?event.codes.losecapture/',    '0x102', $js);
    $js = preg_replace('/uu\.?event.codes.DOMMouseScroll/', '0x104', $js);

    // fakeToArray(...) -> toArray.call(...)
    if ($mobile) {
        $js = preg_replace('/fakeToArray/', 'toArray.call', $js);
    }

    // strip comment line  "//..." -> ""
    $js = preg_replace('/(^|\s)\/\/[^\n]*$/m', '', $js);
    $js = preg_replace('/\/\/\s+[^\n]*$/m', '', $js);

    // strip comment line  "\n/*  */" -> ""
    $js = preg_replace('/\n\/\*(?:\s+)?\*\//m', '', $js);

    // strip comment line  "/*  */\n" -> ""
    $js = preg_replace('/\/\*(?:\s+)?\*\/\n/m', '', $js);

    // strip tail space
    $js = preg_replace('/\s+$/m', '', $js);

    // strip blank line
    $js = preg_replace('/\n(\s*\n)+/m', "\n", $js);

    // strip /* var_args */ comment
    $js = preg_replace('/\/\* var_args \*\//', "", $js);

    // { hash:     value }  ->  { hash: value }
    $js = preg_replace('/(\w+):\s+return/m', "$1: return", $js);  // xxx: return
    $js = preg_replace('/(\w+):\s+false/m', "$1: false", $js);    // xxx: false
    $js = preg_replace('/(\w+):\s+true/m', "$1: true", $js);      // xxx: true
    $js = preg_replace('/(\w+):\s+(uu\.?\w+)/m', "$1: $2", $js);  // xxx: uuxxx
    $js = preg_replace('/(\w+):\s+(NodeSet\w+)/m', "$1: $2", $js);// xxx: NodeSetxxx
    $js = preg_replace('/(\w+):\s+(_\w+)/m', "$1: $2", $js);      // xxx: _xxx
    $js = preg_replace('/(\w+):\s+\{\}/m', "$1: {}", $js);        // xxx: {}
    $js = preg_replace('/(\w+):\s+0/m', "$1: 0", $js);            // xxx: 0

    // "    " -> "\t" (4 spaces -> 1 tab)
    $js = preg_replace_callback('/^[ ]{4,}/m', convert4SpacesTo1Tab, $js);

    // function(arg1,
    //          arg2,       ->  function(arg1, arg2, arg3)
    //          arg3)
    //                 or
    // function(//arg1,arg2,arg3
    //          arg1,
    //          arg2,       ->  function(arg1, arg2, arg3)
    //          arg3)
    $js = preg_replace('/\((?:\n\s+)?(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/',
                       "($1, $2, $3, $4, $5, $6)", $js);
    $js = preg_replace('/\((?:\n\s+)?(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/',
                       "($1, $2, $3, $4, $5)", $js);
    $js = preg_replace('/\((?:\n\s+)?(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/',
                       "($1, $2, $3, $4)", $js);
    $js = preg_replace('/\((?:\n\s+)?(\w+),\n\s+(\w+),\n\s+(\w+)\)/',
                       "($1, $2, $3)", $js);
    $js = preg_replace('/\((?:\n\s+)?(\w+),\n\s+(\w+)\)/',
                       "($1, $2)", $js);

    return $js;
}

// 4 spaces "    " to a "\t"
function convert4SpacesTo1Tab($match) { // @param Array: matchs
                                        // @return String: /[\t]*\s*/
    $length = mb_strlen($match[0]);
    return str_repeat("\t", $length / 4) . ($length % 4 ? " " : "");
}

function autoInclude($js) {
    global $sourceDir, $slash, $unknownAPI, $verbose;

    enumAPI($js);
    if (!count($unknownAPI)) {
        return $js;
    }

    foreach ($unknownAPI as $value) { // $value = "uu.color", "uu.color.api"
        if ($value === "uu.color") {
            continue; // skip
        }

        $keyword = preg_replace('/^uu\./', '', $value); // $keyword = "color", "color.api"

        $ary = preg_split('/\./', strtolower($keyword)); // $ary[0] = "color", $ary[2] = "api"

        $base = $ary[0];

        $src1 = $base . $slash . $base . ".js"; // $src1 = "../src/color/color.js"
        $src2 = '';

        if (count($ary) > 1) {
            $src2 = $base . $slash . $ary[1] . ".js"; // $src2 = "../src/color/api.js"
        }

        if (file_exists($sourceDir . $src1)) { // "../src/color/color.js"
            if ($verbose) {
                echo "  AutoInclude - " . $value . "()\n";
            }
            $js .= loadSource($src1);
        } else if ($src2) {
            if (file_exists($sourceDir . $src2)) { // "../src/color/api.js"
                if ($verbose) {
                    echo "  AutoInclude - " . $value . "()\n";
                }
                $js .= loadSource($src2);
            } else {
                if ($verbose) {
                    echo "  UnknownAPI - " . $value . "()\n";
                }
            }
        }
    }
    return $js;
}
?>
