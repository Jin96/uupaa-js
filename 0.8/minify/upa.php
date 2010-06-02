<?php
include 'pre-process.php';

// --- user setting ---
$libraryCore = "uupaa.js";
$packageDir  = "pkg/";
$sourceDir   = "../src/";
$compiler    = 'g'; // default compiler
$catfood     = "../catfood.js"; // cat work

// --- global ---
$options     = '';
$command     = '';
$mobile      = false;
$verbose     = true;
$separate    = false;
$optimize    = array();
$inputFiles  = array();
$loadedFiles = array(); // avoid duplicate load

// usage:
//  >b.php [-g | -m | -y] [-s] [-mb] [+debug] [-noverbose] [*.js ...] [*.pkg ...]
//    -g    use Google Closure Compiler (default)
//    -m    use Microsoft Ajax Minifier
//    -y    use YUI Compressor
//    -s    separate build. {$libraryCore} に指定されたファイルを別個にビルドします(2回ビルドします)。
//    -mb   build for mobile. {{{!mb ～ }}}!mb を削除し、iPhone/iPad用にビルドします。
//    +debug コードブロック {{{!debug ～ }}}!debug を残します
//    -noverbose 結果表示画面で一時停止しません。バッチビルドが可能になります。
//    *.js  JavaScriptソースコードファイルパスです。
//          相対パスで指定した場合は {$sourceDir} 以下からファイルを読み取ります。
//    *.pkg 一連のJavaScriptソースコードが記載されたパッケージファイルパスです。
//          相対パスで指定した場合は {$packageDir} 以下からファイルを読み取ります。
//
//  1. JavaScriptソースコードをビルドする。
//     ソースコード.js を相対パスで指定しているため {$sourceDir}/ソースコード.js が読み取られる
//
//          >b ソースコード.js
//
//  2. パッケージをビルドする
//     パッケージ.pkg を相対パスで指定しているため {$packageDir}/パッケージ.pkg が読み取られる
//
//          >b パッケージ.pkg
//
//  3. 複数のパッケージやファイルを結合し一つのファイルにビルドする
//
//          >b ソースコード.js パッケージ.pkg パッケージ.pkg
//
//  4. iPhone/iPad用に {$libraryCore} とそれ以外を分割ビルドする
//
//          >b パッケージ.pkg -s -mb
//
//  5. Microsoft Ajax Minifier でビルドする(Windows環境のみ)
//
//          >b パッケージ.pkg -m
//
//  6. YUI Compressor でビルドする
//
//          >b パッケージ.pkg -y
//
//  7. Google Closure Compiler でビルドする
//
//          >b パッケージ.pkg -g

// load source and packages
function loadFiles($inputFiles,   // @param Array:
                   $catfood,      // @param String: output file path
                   $optimize,     // @param Array:
                   $mobile,       // @param Boolean:
                   $separate) {   // @param Boolean:
    global $packageDir, $sourceDir;

    $stripDebugBlock  = !array_key_exists('debug', $optimize);
    $stripMobileBlock =  array_key_exists('mb',    $optimize);

    $js = '';
    foreach($inputFiles as $src) {

        if (getFileExtension($src) == ".pkg") {
            $js .= loadPackage($src);
        } else {
            $js .= loadSource($src);
        }
    }

    // ---  strip {{{!debug ... }}}!debug block ---
    if ($stripDebugBlock) {
        $js = preg_replace('/\{\{\{\+debug([^\n]*)\n.*?\}\}\}\+debug/ms',
                           '', $js);
    }

    // --- strip {{{!mb ... }}}!mb block ---
    if ($stripMobileBlock) {
        $js = preg_replace('/\{\{\{\!mb([^\n]*)\n.*?\}\}\}\!mb/ms',
                           "/*{{{!mb$1 }}}!mb*/", $js);
    }

    // --- pre-process ---
    if (function_exists('preProcess')) {
        $js = preProcess($js, $stripMobileBlock);
    }

    // --- pickup inlcude command ---
    //  #include "source.js"
    $js = preg_replace_callback('/#include\s*[\("\']?([ \w\.\-\+]+)["\'\)]?/ms',
                                includeSource, $js);

    // --- dump ---
    $fp = fopen($catfood, 'w');

    !$fp and die($catfood . " file open fail");

    fwrite($fp, $js);
    fwrite($fp, "\n");

    fclose($fp);
}

function loadPackage($pkg) {
    $js = '';
    $lines = file(pathNormalize(trim($pkg)),
                  FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach($lines as $src) {
        // --- strip comment line phase ---
        // skip blank and C++ comment line
        if (preg_match('/^\s*$/', $src)) { // blank
            continue;
        }
        if (preg_match('/^\/\//', $src)) { // C++ comment
            continue;
        }

        // -mb が指定され、ファイルパスの終わりに //!mb があるならスキップする。
        //      "src/Misc/uu.matrix2d.js //!mb"
        //
        //  スクリプト全体を //{{{!mb ～ //}}}!mb でコメントアウトするのと同じ効果がある
        if ($stripMobileBlock && preg_match('/\s+\/\/!mb\s*$/', $src)) {
            continue;
        }

        if (getFileExtension($src) == ".pkg") {
            $js .= loadPackage($src);
        } else {
            $js .= loadSource($src);
        }
    }
    return $js;
}

function loadSource($src) {
    global $separate, $libraryCore, $loadedFiles;

    $src = pathNormalize(trim($src));

    echo "file(" . $src . ")\n";

    // skip libraryCore file
    if ($separate) {
        if (preg_match('/' . $libraryCore . '$/', $src)) {
            return '';
        }
    }

    // skip duplicate file
    if (in_array($src, $loadedFiles)) {
        return '';
    }
    $loadedFiles[] = $src;

    return normalizeLineBreak(file_get_contents($src));
}

// #include source.js
function includeSource($match) { // @param String: match word
    return "\n" . loadSource($match[1]);
}

function normalizeLineBreak($js) {
    //      \r\n -> \n
    //      \r   -> \n
    //      \n   -> \n
    //
    //      \r = x0d = CR
    //      \n = x0a = LF
    return preg_replace('/(\r\n|\r|\n)/m', "\n", $js);
}

function isWindows() { // @return Boolean: true is Windows OS
                       //                  false is Other OS
    return substr(PHP_OS, 0, 3) == 'WIN';
}

function isFullPath($path) {
    return preg_match('/^\/|\:/', $path) ? true : false;
}

function stripFileExtension($path) {
    return preg_replace('/\.[\w\.]+$/', '', $path);
}

function getFileExtension($path) {
    if (preg_match('/\.js$/', $path)) {
        return '.js';
    } else if (preg_match('/\.head$/', $path)) {
        return '.head';
    } else if (preg_match('/\.pkg$/', $path)) {
        return '.pkg';
    }
    return '';
}

function pathNormalize($path) {
    //  uupaa.js    ->  ../src/uupaa.js
    //  uupaa.pkg   ->  pkg/uupaa.pkg

    global $packageDir, $sourceDir;

    if (preg_match('/\.js$/', $path)) {
        if (!isFullPath($path)) {
            $path = $sourceDir . $path;
        }
    } else if (preg_match('/\.pkg$/', $path)) {
        if (!isFullPath($path)) {
            $path = $packageDir . $path;
        }
    }
    if (isWindows()) {
        $path = preg_replace('/\//', '\\', $path);
    }
    return $path;
}

function buildMinifyToolsCommandline($inputFiles) {
    global $compiler, $options, $catfood, $optimize;

    $command = '';

    switch ($compiler) {
    case "g":
      /*
        $options = '--warning_level=VERBOSE '
                 . '--compilation_level=ADVANCED_OPTIMIZATIONS ';
       */
        $command = 'java -jar tool/lib.g.jar ' . $options . ' --js=' . $catfood
                 . ' --js_output_file=../'
                 . $inputFiles[0]
    //           . '.g'
                 . join($optimize)
                 . '.js';
        break;
    case "y":
        $options = '--charset "utf-8" ';
        $command = 'java -jar tool/lib.y.jar -v ' . $options . ' -o ../'
                 . $inputFiles[0]
    //           . '.y'
                 . join($optimize)
                 . '.js ' . $catfood;
        break;
    case "m":
        $command = 'tool\lib.m.exe -w5 -hc ' . $catfood . ' -o ../'
                 . $inputFiles[0]
    //           . '.m'
                 . join($optimize)
                 . '.js';
        break;
    }
    return $command;
}

function minify() {
    global $compiler, $command, $verbose, $optimize;

    if (isWindows()) {
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

// --- reading commandline args ---
array_shift($argv);

while ($v = array_shift($argv)) {
    switch ($v) {
    case "-s":
        $separate = true;
        break;
    case "-o":
        $catfood = array_shift($argv);
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
    default: // add source / package name
        if (!in_array($v, $inputFiles)) {
            $inputFiles[] = $v;
        }
        break;
    }
}

//    ["mb" => ".mb", "debug" => ".debug"]
// -> ["debug" => ".debug", "mb" => ".mb"]
ksort($optimize);

if ($separate) {
    loadFiles(array($libraryCore), $catfood, $optimize, $mobile, false);

    $command = buildMinifyToolsCommandline(
                    array(stripFileExtension($libraryCore) . ".core"));

    echo "command: {$command}\n";

    minify();
}

loadFiles($inputFiles, $catfood, $optimize, $mobile, $separate);

$command = buildMinifyToolsCommandline($inputFiles);

// --- verbose plan ---
echo "command: {$command}\n";

minify();

?>
