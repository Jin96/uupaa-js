<?php
function preProcess($js,       // @param String: JavaScript source code
                    $mobile) { // @param Boolean: true is "-mb" option
                               // @return String:
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

?>
