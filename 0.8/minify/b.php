<?php
// usage:
//  >b.php [-g | -y | -m] [-s] [+debug] [-noverbose] package [more-packages...]
//    -g    use Google Closure Compiler
//    -y    use Microsoft Ajax Minifier
//    -m    use YUI Compressor
//    -s    separate build, uupaa.jsを別のファイルとしてビルドします。
//    +debug コードブロック {{{!debug ～ }}}!debug を残します
//    -noverbose 結果表示画面で一時停止しません。バッチビルドに利用できます。
//
//  1. パッケージをビルドする
//      >b パッケージ名
//
//  2. 複数のパッケージを結合し一つのファイルとしてビルドする
//      >b パッケージ名 パッケージ名
//
//  3. モバイル用にcore(uupaa.js)を別ファイルに分けて分割ビルドする
//      >b パッケージ名 パッケージ名 -s
//
//  4. Microsoft Ajax Minifier でビルド(Windows環境のみ)
//      >b パッケージ名 パッケージ名 -m
//
//  5. YUI Compressor でビルド
//      >b パッケージ名 パッケージ名 -y
//
//  6. Google Closure Compiler でビルド
//      >b パッケージ名 パッケージ名 -g

// join source files and strip comments
function joinSourceFiles($package,      // @param Array:
                         $outfile,      // @param String:
                         $minify,       // @param Boolean:
                         $optimize,     // @param Array:
                         $mobile,       // @param Boolean:
                         $separate) {   // @param Boolean:
    $slash = isWin() ? "\\" : "/";
    $fp  = fopen($outfile, 'w');
    !$fp and die($outfile . " file open fail");

    $loadedFiles = array();

    foreach($package as $pkg) {
        $packagePath = 'package' . $slash . '#' . $pkg . '.pkg'; // "package/#uupaa.pkg"

        $ary = file($packagePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach($ary as $value) {
            // skip blank and C++ comment line
            if (preg_match('/^\s*$/', $value) // blank
                || preg_match('/^\/\//', $value)) { // C++ comment
                continue;
            }

            $src = trim($value);

            // skip "uupaa.js" file
            if ($separate) {
                if (preg_match('/uupaa.js$/', $src)) {
                    continue;
                }
            }

            // skip duplicate
            if (in_array($src, $loadedFiles)) {
                continue;
            }
            $loadedFiles[] = $src;


            $txt = file_get_contents('..' . $slash . $src);

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

                // fakeToArray(...) -> Array.prototype.slice.call(...)
                if ($mobile) {
                    $txt = preg_replace('/fakeToArray/',
                                        'Array.prototype.slice.call', $txt);
                }

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

function buildMinifyToolsCommandlineOptions($package) {
    global $compiler, $options, $outfile, $optimize;

    $command = '';

    switch ($compiler) {
    case "g":
      /*
        $options = '--warning_level=VERBOSE '
                 . '--compilation_level=ADVANCED_OPTIMIZATIONS ';
       */
        $command = 'java -jar tool/lib.g.jar ' . $options . ' --js=' . $outfile
                 . ' --js_output_file=../'
                 . $package[0]
    //           . '.g'
                 . join($optimize)
                 . '.js';
        break;
    case "y":
        $options = '--charset "utf-8" ';
        $command = 'java -jar tool/lib.y.jar -v ' . $options . ' -o ../'
                 . $package[0]
    //           . '.y'
                 . join($optimize)
                 . '.js ' . $outfile;
        break;
    case "m":
        $command = 'tool\lib.m.exe -w5 -hc ' . $outfile . ' -o ../'
                 . $package[0]
    //           . '.m'
                 . join($optimize)
                 . '.js';
        break;
    }
    return $command;
}

function showBuildMenu($package) {
    global $command, $dependenceList;

    $pkg = join(",", $package);

    echo "- package: {$pkg}\n";
    echo "- command: {$command}\n";
    echo "- depend: " . join(', ', $dependenceList) . "\n";
}

function doit() {
    global $compiler, $command, $verbose, $optimize;

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
}

// --- global ---
$v = "";
$minify = true;
$package = array();
$outfile = "../catfood.js";
$options = '';
$compiler = 'y';
$command = '';
$mobile = false;
$optimize = array();
$dependenceList = array();
$verbose = true;
$separate = false;

// --- reading commandline args ---
array_shift($argv);

while ($v = array_shift($argv)) {
    switch ($v) {
    case "-s":
        $separate = true;
        break;
    case "-o":
        $outfile = array_shift($argv);
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
    case "-mb": // for mobile, iPhone, iPad, Android
        $optimize["mb"] = ".mb";
        $mobile = true;
        break;
    case "+debug": // keep {{{!debug .... }}}!debug
        $optimize["debug"] = ".debug";
        break;
    case "-noverbose":
        $verbose = false;
        break;
    default: // add package name
        if (!in_array($v, $package)) {
            $package[] = $v;
        }
        break;
    }
}

//    ["mb" => ".mb", "debug" => ".debug"]
// -> ["debug" => ".debug", "mb" => ".mb"]
ksort($optimize);

if ($separate) {
    joinSourceFiles(array('uupaa'), $outfile, $minify, $optimize, $mobile, false);

    $command = buildMinifyToolsCommandlineOptions(array('uupaa'));
    showBuildMenu(array('uupaa'));
    doit();
}

joinSourceFiles($package, $outfile, $minify, $optimize, $mobile, $separate);

$command = buildMinifyToolsCommandlineOptions($package);
showBuildMenu($package);
doit();

?>
