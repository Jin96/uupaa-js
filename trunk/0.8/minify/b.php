<?php
// usage:
//  >b.php [package] [-g | -y | -m | -j] [+debug] [-noverbose]
//    -g    Google Closure Compiler
//    -y    Microsoft Ajax Minifier
//    -m    YUI Compressor
//    -j    ファイルの結合と容量削減のみを行い、ツールによるminifyは行わない。
//    +debug コードブロック {{{!debug ～ }}}!debug を残します
//    -noverbose 結果表示画面で一時停止しません。バッチビルドに利用できます。

// join source files and strip comments
function joinSourceFiles($packagefile, $outfile, $minify, $optimize, $mobile,
                         $coreOnly, $skipCore) {
    $dir    = isWin() ? '..\\' : '../';
    $ary    = file($packagefile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $fp     = fopen($outfile, 'w');

    !$fp and die($outfile . " file open fail");

    foreach($ary as $value) {
        // skip blank and C++ comment line
        if (preg_match('/^\s*$/', $value) // blank
            || preg_match('/^\/\//', $value)) { // C++ comment
            continue;
        }

        $src = trim($value);
        if ($skipCore) {
            if (preg_match('/uu.js$/i', $src)) {
                continue;
            }
        }
        $txt = file_get_contents($dir . $src);

        // convert CRLF
        //      \r\n(CRLF) -> \n(LF)
        //      \r = x0d = CR
        //      \n = x0a = LF
        $txt = preg_replace('/(\r\n|\r|\n)/m', "\n", $txt);

        // strip {{{!debug ... }}}!debug
        if (!array_key_exists('debug', $optimize)) {
            $txt = preg_replace('/\{\{\{\!debug([^\n]*)\n.*?\}\}\}\!debug/ms',
                                '', $txt);
        }

        // strip {{{!mb ... }}}!mb
        if (array_key_exists('mb', $optimize)) {
            $txt = preg_replace('/\{\{\{\!mb([^\n]*)\n.*?\}\}\}\!mb/ms',
                                "/*{{{!mb$1 }}}!mb*/", $txt);
        }

        // pickup {{{!depend ... }}}!depend
        $txt = preg_replace_callback('/\{\{\{\!depend([^\n]*)\n.*?\}\}\}\!depend/ms',
                                     collectDependenceList, $txt);

        // minify
        if ($minify) {
            // --- pre-process phase ---
            $txt = preg_replace('/uu\.?type.HASH/',         '1', $txt); // uu.?type.HASH -> 1
            $txt = preg_replace('/uu\.?type.NODE/',         '2', $txt);
            $txt = preg_replace('/uu\.?type.FAKEARRAY/',    '4', $txt);
            $txt = preg_replace('/uu\.?type.DATE/',         '8', $txt);
            $txt = preg_replace('/uu\.?type.NULL/',         '16', $txt);
            $txt = preg_replace('/uu\.?type.UNDEFINED/',    '32', $txt);
            $txt = preg_replace('/uu\.?type.VOID/',         '32', $txt);
            $txt = preg_replace('/uu\.?type.BOOLEAN/',      '64', $txt);
            $txt = preg_replace('/uu\.?type.FUNCTION/',     '128', $txt);
            $txt = preg_replace('/uu\.?type.NUMBER/',       '256', $txt);
            $txt = preg_replace('/uu\.?type.STRING/',       '512', $txt);
            $txt = preg_replace('/uu\.?type.ARRAY/',        '1024', $txt);
            $txt = preg_replace('/uu\.?type.REGEXP/',       '2048', $txt);

            // strip comment line  "//..." -> ""
            $txt = preg_replace('/(^|\s)\/\/[^\n]*$/m', '', $txt);
            $txt = preg_replace('/\/\/\s+[^\n]*$/m', '', $txt);

            // strip comment line  "\n/**/" -> ""
            $txt = preg_replace('/\n\/\*\*\//m', '', $txt);

            // strip tail space
            $txt = preg_replace('/\s+$/m', '', $txt);

            // strip blank line
            $txt = preg_replace('/\n(\s*\n)+/m', "\n", $txt);

            // strip /* var_args */ comment
            $txt = preg_replace('/\/\* var_args \*\//', "", $txt);

            // { hash:     value }  ->  { hash: value }
            $txt = preg_replace('/(\w+):\s+return/m', "$1: return", $txt);  // xxx: return
            $txt = preg_replace('/(\w+):\s+false/m', "$1: false", $txt);    // xxx: false
            $txt = preg_replace('/(\w+):\s+true/m', "$1: true", $txt);      // xxx: true
            $txt = preg_replace('/(\w+):\s+(uu\.?\w+)/m', "$1: $2", $txt);  // xxx: uuxxx
            $txt = preg_replace('/(\w+):\s+(jam\w+)/m', "$1: $2", $txt);    // xxx: jamxxx
            $txt = preg_replace('/(\w+):\s+(bite\w+)/m', "$1: $2", $txt);   // xxx: bitexxx
            $txt = preg_replace('/(\w+):\s+(_\w+)/m', "$1: $2", $txt);      // xxx: _xxx
            $txt = preg_replace('/(\w+):\s+\{\}/m', "$1: {}", $txt);        // xxx: {}
            $txt = preg_replace('/(\w+):\s+0/m', "$1: 0", $txt);            // xxx: 0

            // "    " -> "\t" (4 spaces -> 1 tab)
            $txt = preg_replace_callback('/^[ ]{4,}/m', convertSpacesToTab, $txt);

            // function(arg,
            //          arg,       ->  function(arg, arg, arg)
            //          arg)
            $txt = preg_replace('/\((\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/',
                                "($1, $2, $3, $4, $5, $6)", $txt);
            $txt = preg_replace('/\((\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/',
                                "($1, $2, $3, $4, $5)", $txt);
            $txt = preg_replace('/\((\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/',
                                "($1, $2, $3, $4)", $txt);
            $txt = preg_replace('/\((\w+),\n\s+(\w+),\n\s+(\w+)\)/',
                                "($1, $2, $3)", $txt);
            $txt = preg_replace('/\((\w+),\n\s+(\w+)\)/',
                                "($1, $2)", $txt);


        }
        fwrite($fp, $txt);
        fwrite($fp, "\n");

        if ($coreOnly) {
            if (preg_match('/uu.js$/i', $src)) {
                break;
            }
        }
    }
    fclose($fp);
}

// collect dependence list
function collectDependenceList($match) { // @param String: match word
    global $dependenceList;

    $ary = preg_split('/[\s,]+/', trim($match[1]));
    $dependenceList = array_unique(array_merge($dependenceList, $ary));
}

// "    " -> "\t"
function convertSpacesToTab($match) { // @param Array: matchs
                                      // @return String: /[\t]*\s*/
    $length = mb_strlen($match[0]);
    return str_repeat("\t", $length / 4) . ($length % 4 ? " " : "");
}

// is Windows OS
function isWin() { // @return Boolean: true is Windows OS
                   //                  false is Other OS
    return substr(PHP_OS, 0, 3) == 'WIN';
}

// --- global ---
$v = "";
$minify = true;
$package = "full";
$outfile = "dogfood.js";
$slash = isWin() ? "\\" : "/";
$options = '';
$compiler = "y";
$command = "";
$mobile = false;
$coreOnly = false;
$skipCore = false;
$optimize = array();
$dependenceList = array();
$verbose = true;

// --- reading commandline args ---
array_shift($argv);

while ($v = array_shift($argv)) {
    switch ($v) {
    case "-j": // join only
        $compiler = "";
        break;
    case "-g": // use Google minifier
        $compiler = "g";
        break;
    case "-y": // use Yahoo minifier
        $compiler = "y";
        break;
    case "-m": // use MicroSoft minifier
        $compiler = "m";
        break;
    case "-mb": // for iPhone
        $optimize["mb"] = ".mb";
        $mobile = true;
        break;
    case "-coreonly":
        $coreOnly = true;
        break;
    case "-skipcore":
        $skipCore = true;
        break;
    case "+debug": // keep {{{!debug .... }}}!debug
        $optimize["debug"] = ".debug";
        break;
    case "-noverbose":
        $verbose = false;
        break;
    default: // set package name
        $package = $v;
        break;
    }
}

//    ["mb" => ".mb", "debug" => ".debug"]
// -> ["debug" => ".debug", "mb" => ".mb"]
ksort($optimize);

// build package name
$packagefile = 'package' . $slash . '#' . $package . '.pkg'; // "package/#full.pkg"

// join source files
joinSourceFiles($packagefile, $outfile, $minify, $optimize, $mobile,
                $coreOnly, $skipCore);

// --- build mifify tools commandline options ---
switch ($compiler) {
case "g":
  /*
    $options = '--warning_level=VERBOSE '
             . '--compilation_level=ADVANCED_OPTIMIZATIONS ';
   */
    $command = 'java -jar tool/lib.g.jar ' . $options . ' --js=' . $outfile
             . ' --js_output_file=../'
             . $package
//           . '.g'
//           . join($optimize)
             . '.js';
    break;
case "y":
    $options = '--charset "utf-8" ';
    $command = 'java -jar tool/lib.y.jar -v ' . $options . ' -o ../'
             . $package
//           . '.y'
//           . join($optimize)
             . '.js ' . $outfile;
    break;
case "m":
    $command = 'tool\lib.m.exe -w5 -hc ' . $outfile . ' -o ../'
             . $package
//           . '.m'
//           . join($optimize)
             . '.js';
    break;
}

// ------------------------------------
echo "- package: {$packagefile}\n";
echo "- command: {$command}\n";
echo "- depend: " . join(', ', $dependenceList) . "\n";
// ------------------------------------

// --- do it ---
if ($compiler) {
    if (isWin()) {
        $fp = fopen('mini.bat', 'w'); // or die

        fwrite($fp, $command . "\n");
        if ($verbose) {
            fwrite($fp, "pause\n");
        }
        fwrite($fp, "exit\n");

        fclose($fp);
        // exec batch
        shell_exec('start mini.bat');

        unlink('mini.bat');
    } else {
        shell_exec($command);
    }
} else {
    copy($outfile, "../" . $package
//                       . join($optimize)
                         . '.js');
}

?>
