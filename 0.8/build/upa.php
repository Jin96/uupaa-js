<?php

// --- user setting ---
$libraryCore = "uupaa.js";
$preprosess  = "js.pp";         // pre-processor
$sourceDir   = "../src/";
$compiler    = "g";             // default compiler
$catfood     = "../catfood.js"; // temporary file
$castoff     = array();         // "form,canvas,..."

// --- global ---
$slash       = '/';
$mobile      = false;
$verbose     = false;
$skipCore    = false;
$inputFiles  = array($libraryCore);
$loadedFiles = array(); // avoid duplicate load

// load source and packages
function loadFiles($inputFiles) { // @param Array:
    global $catfood;

    $js = '';
    foreach ($inputFiles as $src) {
        $js .= loadSource($src);
    }
    if (function_exists('autoInclude')) {
        $js = autoInclude($js);
    }

    // create catfood
    $fp = fopen($catfood, 'w') or die($catfood . " file open fail");

    fwrite($fp, $js);
    fwrite($fp, "\n");
    fclose($fp);
}

function loadSource($src) { // @param FilePathString:
                            // @return JavaScriptExpressionString:
    global $verbose, $skipCore, $libraryCore, $loadedFiles, $slash,
           $mobile, $castoff;

    $src = pathNormalize(trim($src));

    // skip libraryCore file
    if ($skipCore && preg_match('/' . $libraryCore . '$/', $src)) {
        return '';
    }
    // avoid duplicate source
    if (in_array($src, $loadedFiles)) {
        return '';
    }
    $loadedFiles[] = $src;

    if ($verbose) {
        $tmpsrc = preg_replace('/\\\\/', '/', '..' . $slash . $src);
        echo '<script src="' . $tmpsrc . '"></script>' . "\n";
    }
    // normalize line break
    $js = preg_replace('/(\r\n|\r|\n)/m', "\n", file_get_contents($src));

    // #include "source.js"
    $js = preg_replace_callback('/#include\s+["\'<]?([\w\.\-\+\/]+)[>"\']?/ms',
                                includeSource, $js);
    // pre-process
    if (function_exists('preProcess')) {
        $js = preProcess($js, $mobile, $castoff);
    }
    return $js;
}

function includeSource($match) { // @param String: match word
                                 // @return JavaScriptExpressionString:
    return "\n" . loadSource($match[1]) . "\n//";
}

function isWindows() { // @return Boolean:
    return substr(PHP_OS, 0, 3) == 'WIN';
}

function pathNormalize($path) { // @param FilePathString:  "..\dir/file.ext"
                                // @return FilePathString: "../dir/file.ext"
    global $sourceDir;

    if (!preg_match('/^\/|\:/', $path)) { // rel-path?
        // add dir
        $path = $sourceDir . $path;     //  uupaa.js    ->  ../src/uupaa.js
    }
    if (isWindows()) {
        $path = preg_replace('/\//', '\\', $path);
    }
    return $path;
}

function minify() {
    global $compiler, $skipCore, $verbose, $catfood, $mobile, $libraryCore;

    $command = '';

    // strip file extension
    $outfile = preg_replace('/\.[\w\.]+$/', '', $libraryCore);
    if ($mobile) {
        $outfile .= $skipCore ? '.mb2.js' : '.mb.js';
    } else {
        $outfile .= '.js';
    }

    switch ($compiler) {
    case "g":
//      $options = '--warning_level=VERBOSE '
//               . '--compilation_level=ADVANCED_OPTIMIZATIONS ';
        $command = 'java -jar tool.g.jar ' . $options . ' --js=' . $catfood
                 . ' --js_output_file=../' . $outfile;
        break;
    case "y":
        $options = '--charset "utf-8" ';
        $command = 'java -jar tool.y.jar -v ' . $options . ' -o ../'
                 . $outfile . ' ' . $catfood;
        break;
    case "m":
        $command = 'tool.m.exe -w5 -hc ' . $catfood . ' -o ../'
                 . $outfile;
    }

    if ($verbose) {
        echo "\n\ncommand: {$command}\n\n";
    }

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
    if (1) { // $verbose
        $fz = filesize('../' . $outfile);
        printf("filesize = %.02fkB(%dbyte)\n", $fz / 1024, $fz);
    }
}

// --- init ---
$slash = isWindows() ? '\\' : '/';

// --- reading commandline args ---
array_shift($argv);

while ($v = array_shift($argv)) {
    switch ($v) {
    case "-g":      $compiler = "g"; break;
    case "-y":      $compiler = "y"; break;
    case "-m":      $compiler = "m"; break;
    case "-mb":     $mobile  = true; break;
    case "-v":      $verbose = true; break;
    case "-pp":     $preprosess = array_shift($argv); break;
    case "-core":   $libraryCore = array_shift($argv);
                    $inputFiles = array($libraryCore); break;
    case "-srcdir": $sourceDir = array_shift($argv); break;
    case "-off":    $castoff = explode("/", array_shift($argv)); break;
    default:        if (!in_array($v, $inputFiles)) {
                        $inputFiles[] = $v;
                    }
    }
}

include $preprosess;

if ($mobile) {
    loadFiles(array($libraryCore));
    minify();

    if (count($inputFiles) < 2) {
        return;
    }
    $skipCore = true;
}
loadFiles($inputFiles);
minify();

?>
