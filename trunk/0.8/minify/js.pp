<?php

function addLibraryNamespacePrefix($name) {
    global $ignoreAPIHasDots;

    $ignoreAPIHasDots[] = "uu." . $name;
}

$unknownAPI = array(); // array([0] => "uu.color")
$ignoreAPIHasDots = array();
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

function preProcess($js,       // @param String: JavaScript source code
                    $mobile) { // @param Boolean: true is "-mb" option
                               // @return String:
    // strip {{{!mb ... }}}!mb code block
    if ($mobile) {
        $js = preg_replace('/\{\{\{\!mb([^\n]*)\n.*?\}\}\}\!mb/ms',
                           "/*{{{!mb$1 }}}!mb*/", $js);
    }

    // typeof alias
    $js = preg_replace('/uu\.?type.HASH/',         '1', $js); // uu.?type.HASH -> 1
    $js = preg_replace('/uu\.?type.NODE/',         '2', $js);
    $js = preg_replace('/uu\.?type.FAKEARRAY/',    '4', $js);
    $js = preg_replace('/uu\.?type.DATE/',         '8', $js);
    $js = preg_replace('/uu\.?type.NULL/',         '16', $js);
    $js = preg_replace('/uu\.?type.UNDEFINED/',    '32', $js);
    $js = preg_replace('/uu\.?type.VOID/',         '32', $js);
    $js = preg_replace('/uu\.?type.BOOLEAN/',      '64', $js);
    $js = preg_replace('/uu\.?type.FUNCTION/',     '128', $js);
    $js = preg_replace('/uu\.?type.NUMBER/',       '256', $js);
    $js = preg_replace('/uu\.?type.STRING/',       '512', $js);
    $js = preg_replace('/uu\.?type.ARRAY/',        '1024', $js);
    $js = preg_replace('/uu\.?type.REGEXP/',       '2048', $js);

    // Event.type alias
    $js = preg_replace('/uu\.?event.xtypes.mousedown/',      '1', $js);
    $js = preg_replace('/uu\.?event.xtypes.mouseup/',        '2', $js);
    $js = preg_replace('/uu\.?event.xtypes.mousemove/',      '3', $js);
    $js = preg_replace('/uu\.?event.xtypes.mousewheel/',     '4', $js);
    $js = preg_replace('/uu\.?event.xtypes.click/',          '5', $js);
    $js = preg_replace('/uu\.?event.xtypes.dblclick/',       '6', $js);
    $js = preg_replace('/uu\.?event.xtypes.keydown/',        '7', $js);
    $js = preg_replace('/uu\.?event.xtypes.keypress/',       '8', $js);
    $js = preg_replace('/uu\.?event.xtypes.keyup/',          '9', $js);
    $js = preg_replace('/uu\.?event.xtypes.mouseenter/',     '10', $js);
    $js = preg_replace('/uu\.?event.xtypes.mouseleave/',     '11', $js);
    $js = preg_replace('/uu\.?event.xtypes.mouseover/',      '12', $js);
    $js = preg_replace('/uu\.?event.xtypes.mouseout/',       '13', $js);
    $js = preg_replace('/uu\.?event.xtypes.contextmenu/',    '14', $js);
    $js = preg_replace('/uu\.?event.xtypes.focus/',          '15', $js);
    $js = preg_replace('/uu\.?event.xtypes.blur/',           '16', $js);
    $js = preg_replace('/uu\.?event.xtypes.resize/',         '17', $js);
    $js = preg_replace('/uu\.?event.xtypes.scroll/',         '18', $js);
    $js = preg_replace('/uu\.?event.xtypes.online/',         '50', $js);
    $js = preg_replace('/uu\.?event.xtypes.offline/',        '51', $js);
    $js = preg_replace('/uu\.?event.xtypes.message/',        '52', $js);
    $js = preg_replace('/uu\.?event.xtypes.losecapture/',    '0x102', $js);
    $js = preg_replace('/uu\.?event.xtypes.DOMMouseScroll/', '0x104', $js);

    // fakeToArray(...) -> Array[_prototype].slice.call(...)
    if ($mobile) {
        $js = preg_replace('/fakeToArray/',
                            'Array[_prototype].slice.call', $js);
    }

    // strip comment line  "//..." -> ""
    $js = preg_replace('/(^|\s)\/\/[^\n]*$/m', '', $js);
    $js = preg_replace('/\/\/\s+[^\n]*$/m', '', $js);

    // strip comment line  "\n/**/" -> ""
    $js = preg_replace('/\n\/\*\*\//m', '', $js);

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
    $js = preg_replace('/(\w+):\s+(jam\w+)/m', "$1: $2", $js);    // xxx: jamxxx
    $js = preg_replace('/(\w+):\s+(bite\w+)/m', "$1: $2", $js);   // xxx: bitexxx
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
