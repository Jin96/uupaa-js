<?php
function preProcess($js,       // @param String: JavaScript source code
                    $mobile) { // @param Boolean: true is "-mb" option
                               // @return String:
    $js = preg_replace('/^(?:char|int|long)\s+([^\(]+)\(/ms', 'function $1(', $js);

    return $js;
}

// 4 spaces "    " to a "\t"
function convert4SpacesTo1Tab($match) { // @param Array: matchs
                                        // @return String: /[\t]*\s*/
    $length = mb_strlen($match[0]);
    return str_repeat("\t", $length / 4) . ($length % 4 ? " " : "");
}

?>
