<?php
include 'pre-process.php';

// --- user setting ---
$libraryCore = "uupaa.js";
$packageDir  = "pkg/";
$sourceDir   = "../src/";
$compiler    = "g";             // default compiler
$catfood     = "../catfood.js"; // temporary file

// --- global ---
$mobile      = false;
$verbose     = true;
$separate    = false;
$inputFiles  = array();
$loadedFiles = array(); // avoid duplicate load

// load source and packages
function loadFiles($inputFiles,   // @param Array:
                   $catfood,      // @param String: output file path
                   $mobile,       // @param Boolean:
                   $separate) {   // @param Boolean:
    $js = '';
    foreach($inputFiles as $src) {
        $js .= preg_match('/\.pkg$/', $src) ? loadPackage($src)
                                            : loadSource($src);
    }
    // --- strip {{{!mb ... }}}!mb code block ---
    if ($mobile) {
        $js = preg_replace('/\{\{\{\!mb([^\n]*)\n.*?\}\}\}\!mb/ms',
                           "/*{{{!mb$1 }}}!mb*/", $js);
    }
    // --- pre-process ---
    if (function_exists('preProcess')) {
        $js = preProcess($js, $mobile);
    }
    // --- #include "source.js" ---
    $js = preg_replace_callback('/#include\s*[\("\']?([ \w\.\-\+]+)["\'\)]?/ms',
                                includeSource, $js);
    // --- create catfood ---
    $fp = fopen($catfood, 'w') or die($catfood . " file open fail");

    fwrite($fp, $js);
    fwrite($fp, "\n");
    fclose($fp);
}

function loadPackage($pkg) {
    $js = '';
    $lines = file(pathNormalize(trim($pkg)),
                  FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach($lines as $src) {
        if (preg_match('/^\s*$/', $src)) { // strip blank
            continue;
        }
        if (preg_match('/^\/\//', $src)) { // strip C++ comment
            continue;
        }
        $js .= preg_match('/\.pkg$/', $src) ? loadPackage($src)
                                            : loadSource($src);
    }
    return $js;
}

function loadSource($src) {
    global $separate, $libraryCore, $loadedFiles;

    $src = pathNormalize(trim($src));
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

    echo "file(" . $src . ")\n";

    // normalize line break
    return preg_replace('/(\r\n|\r|\n)/m', "\n", file_get_contents($src));
}

// #include source.js
function includeSource($match) { // @param String: match word
    return "\n" . loadSource($match[1]);
}

function isWindows() { // @return Boolean:
    return substr(PHP_OS, 0, 3) == 'WIN';
}

function stripFileExtension($path) {
    return preg_replace('/\.[\w\.]+$/', '', $path);
}

function pathNormalize($path) {
    global $packageDir, $sourceDir;

    if (preg_match('/\.js$/', $path)) {
        if (!isFullPath($path)) {
            $path = $sourceDir . $path;     //  uupaa.js    ->  ../src/uupaa.js
        }
    } else if (preg_match('/\.pkg$/', $path)) {
        if (!isFullPath($path)) {
            $path = $packageDir . $path;    //  uupaa.pkg   ->  pkg/uupaa.pkg
        }
    }
    if (isWindows()) {
        $path = preg_replace('/\//', '\\', $path);
    }
    return $path;
}

function isFullPath($path) {
    return preg_match('/^\/|\:/', $path) ? true : false;
}

function minify($inputFiles, $catfood, $mobile) {
    global $compiler, $verbose;

    $command = '';
    $optimize = $mobile ? ".mb" : "";

    switch ($compiler) {
    case "g":
//      $options = '--warning_level=VERBOSE '
//               . '--compilation_level=ADVANCED_OPTIMIZATIONS ';
        $command = 'java -jar tool/lib.g.jar ' . $options . ' --js=' . $catfood
                 . ' --js_output_file=../'
                 . $inputFiles[0] . $optimize . '.js';
        break;
    case "y":
        $options = '--charset "utf-8" ';
        $command = 'java -jar tool/lib.y.jar -v ' . $options . ' -o ../'
                 . $inputFiles[0] . $optimize . '.js ' . $catfood;
        break;
    case "m":
        $command = 'tool\lib.m.exe -w5 -hc ' . $catfood . ' -o ../'
                 . $inputFiles[0] . $optimize . '.js';
    }

    echo "command: {$command}\n";

    if (isWindows()) {
        $fp = fopen('mini.bat', 'w'); // or die

        fwrite($fp, $command . "\n");
        if ($verbose) {
            fwrite($fp, "pause\n");
        }
        fwrite($fp, "exit\n");
        fclose($fp);

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
    case "-g":      $compiler = "g"; break;
    case "-y":      $compiler = "y"; break;
    case "-m":      $compiler = "m"; break;
    case "-mb":     $mobile = $separate = true; break;
    case "-batch":  $verbose = false; break;
    default:        if (!in_array($v, $inputFiles)) {
                        $inputFiles[] = $v;
                    }
    }
}

if ($separate) {
    loadFiles(array($libraryCore), $catfood, $mobile, false);
    minify(array(stripFileExtension($libraryCore)), $catfood, $mobile);
}
loadFiles($inputFiles, $catfood, $mobile, $separate);
minify($inputFiles, $catfood, $mobile);

?>
