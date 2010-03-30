<?php
// usage:
//  >b.php [package] [-g | -y | -m | -j] [-out outfile] [-mb] [-debug]
//    -g    Google Closure Compiler
//    -y    Microsoft Ajax Minifier
//    -m    YUI Compressor
//    -out  outfile, default: "uupaa.js"
//    -mb   コードブロック {{{!mb ～ }}}!mb を切り落とします。
//          IE用や余計なコードを切り落とし、
//          iPhone, Android用にファイルサイズをコンパクトにします。
//    -debug コードブロック {{{!debug ～ }}}!debug を残します

// join source files and strip comments
function joinSourceFiles($packagefile, $outfile, $minify, $optimize) {
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
        $txt = file_get_contents($dir . $src);

        // convert CRLF
        // \r\n(CRLF) -> \n(LF)
        // \r = x0d = CR, \n = x0a = LF
        $txt = preg_replace('/(\r\n|\r|\n)/m', "\n", $txt);

        // strip {{{!debug ～ }}}!debug
        if (!array_key_exists('debug', $optimize)) {
            $txt = preg_replace('/\{\{\{\!debug([^\n]*)\n.*?\}\}\}\!debug/ms',
                                '', $txt);
        }

        // strip {{{!mb ～ }}}!mb
        if (array_key_exists('mb', $optimize)) {
            $txt = preg_replace('/\{\{\{\!mb([^\n]*)\n.*?\}\}\}\!mb/ms',
                                "/*{{{!mb$1 }}}!mb*/", $txt);
        }

        // pickup {{{!depend uu, uu.css }}}!depend
        $txt = preg_replace_callback('/\{\{\{\!depend([^\n]*)\n.*?\}\}\}\!depend/ms',
                                     collectDependenceList, $txt);

        // minify
        if ($minify) {
            // --- pre-process phase ---
            $txt = preg_replace('/uu\.?type.HASH/',         '0x001', $txt);
            $txt = preg_replace('/uu\.?type.NODE/',         '0x002', $txt);
            $txt = preg_replace('/uu\.?type.FAKEARRAY/',    '0x004', $txt);
            $txt = preg_replace('/uu\.?type.DATE/',         '0x008', $txt);
            $txt = preg_replace('/uu\.?type.NULL/',         '0x010', $txt);
            $txt = preg_replace('/uu\.?type.UNDEFINED/',    '0x020', $txt);
            $txt = preg_replace('/uu\.?type.BOOLEAN/',      '0x040', $txt);
            $txt = preg_replace('/uu\.?type.FUNCTION/',     '0x080', $txt);
            $txt = preg_replace('/uu\.?type.NUMBER/',       '0x100', $txt);
            $txt = preg_replace('/uu\.?type.STRING/',       '0x200', $txt);
            $txt = preg_replace('/uu\.?type.ARRAY/',        '0x400', $txt);
            $txt = preg_replace('/uu\.?type.REGEXP/',       '0x800', $txt);
            $txt = preg_replace('/uu\.?type.CSS/',          '0x1000', $txt);

            // strip comment line  "//..." -> ""
            $txt = preg_replace('/(^|\s)\/\/[^\n]*$/m', '', $txt);

            // strip comment line  "\n/**/" -> ""
            $txt = preg_replace('/\n\/\*\*\//m', '', $txt);

            // strip tail space
            $txt = preg_replace('/\s+$/m', '', $txt);

            // strip blank line
            $txt = preg_replace('/\n(\s*\n)+/m', "\n", $txt);

            // strip /* var_args */ comment
            $txt = preg_replace('/\/\* var_args \*\//', "", $txt);

            // { hash:     value }  ->  { hash: value }
            $txt = preg_replace('/(\w+):\s+(uu\.?\w+)/m', "$1: $2", $txt);  // xxx: uuxxx
            $txt = preg_replace('/(\w+):\s+(jam\w+)/m', "$1: $2", $txt);    // xxx: jamxxx
            $txt = preg_replace('/(\w+):\s+(bite\w+)/m', "$1: $2", $txt);   // xxx: bitexxx
            $txt = preg_replace('/(\w+):\s+(_\w+)/m', "$1: $2", $txt);      // xxx: _xxx
            $txt = preg_replace('/(\w+):\s+\{\}/m', "$1: {}", $txt);        // xxx: {}
            $txt = preg_replace('/(\w+):\s+0/m', "$1: 0", $txt);            // xxx: 0

            // "    " -> "\t" (4space -> 1tab)
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
$minify = 1;
$package = "full";
$outfile = isWin() ? "..\\uupaa.js" : "../uupaa.js";
$options = '';
$compiler = "y";
$command = "";
$optimize = array();
$dependenceList = array();

// --- reading commandline args ---
array_shift($argv);

while ($v = array_shift($argv)) {
    switch ($v) {
    case "-j": // join only
     // $minify = 0;
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
        break;
    case "-debug": // keep {{{!debug .... }}}!debug
        $optimize["debug"] = ".debug";
        break;
    case "-out": // overwrite out filename (default: "../uupaa.js")
        $outfile = isWin() ? "..\\" : "../";
        $outfile = $outfile . array_shift($argv);
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
$packagefile = '#' . $package . '.pkg'; // "#full.pkg"

// join source files
joinSourceFiles($packagefile, $outfile, $minify, $optimize);

// --- build mifify tools commandline options ---
switch ($compiler) {
case "g":
  /*
    $options = '--warning_level=VERBOSE '
             . '--compilation_level=ADVANCED_OPTIMIZATIONS ';
   */
    $command = 'java -jar lib.g.jar ' . $options . ' --js=' . $outfile
             . ' --js_output_file=mini.'
             . $package . '.g' . join($optimize) . '.js';
    break;
case "y":
    $options = '--charset "utf-8" ';
    $command = 'java -jar lib.y.jar -v ' . $options . ' -o mini.'
             . $package . '.y' . join($optimize) . '.js ' . $outfile;
    break;
case "m":
    $command = 'lib.m.exe -w5 -hc ' . $outfile . ' -o mini.'
             . $package . '.m' . join($optimize) . '.js';
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
        fwrite($fp, "pause\n");
        fwrite($fp, "exit\n");

        fclose($fp);
        // exec batch
        shell_exec('start mini.bat');

        unlink('mini.bat');
    } else {
        shell_exec($command);
    }
}

?>
