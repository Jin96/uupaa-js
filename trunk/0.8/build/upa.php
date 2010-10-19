<?php

// --- user setting ---
$outputDir   = "../js/";        // output dir (-outdir ...)
$libraryCore = "uupaa.js";      // library core (-lib ...)
$preprosess  = "js.pp";         // pre-processor (-pp ...)
$sourceDir   = "../src/";       // source dir (-srcdir ...)
$compiler    = "g";             // default compiler (-g / -m / -y)
$catfood     = "catfood.js";    // temporary file (lazy build)
$castoff     = array();         // "form,canvas,..."
$castoffAll  = array(
    "form", "snippet", "image", "color",
    "test", "fx", "ajax",
    "junction",
    "svg", "canvas", "canvasvml", "canvassl", "canvasfl",
    "flash", "nodeset", "audio",
    "eventresize", "eventcyclic",
    "live", "cssbox",
    "codec", "md5", "sha1", "hmac", "msgpack",
    "sprintf", "url", "font", "cookie", "storage",
    "ui", "uislider",
);

// --- global ---
$perfPoint   = time(); // keep current time
$slash       = '/';
$mobile      = false;
$memento     = false;
$verbose     = false;
$inputFiles  = array($libraryCore);
$loadedFiles = array(); // avoid duplicate load
$compileOption = ""; // compile option (-memento)
$loadedFileSize = 0;
$forceOutputFileName = "";

// load source
function loadFiles($inputFiles) { // @param Array:
    global $catfood;

    $js = '';
    foreach ($inputFiles as $src) {
        $js .= loadSource($src);
    }
    if (function_exists('autoInclude')) {
        $js = autoInclude($js);
    }

    // create "../js/catfood.js"
    $fp = fopen($catfood, 'w') or die($catfood . " file open fail");

    fwrite($fp, $js);
    fwrite($fp, "\n");
    fclose($fp);
}

function loadSource($src) { // @param FilePathString:
                            // @return JavaScriptExpressionString:
    global $verbose, $libraryCore, $loadedFiles, $slash,
           $mobile, $castoff, $loadedFileSize;

    $src = pathNormalize(trim($src));

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
    $loadedFileSize = $loadedFileSize + filesize($src);
    $js = preg_replace('/(\r\n|\r|\n)/m', "\n", file_get_contents($src));

    // include "../src/source.js"
    $js = preg_replace_callback('/#include\s+["\'<]?([\w\.\-\+\/]+)[>"\']?/ms',
                                includeSource, $js);
    // pre-process
    if (function_exists('preProcess')) {
        $js = stripCodeBlock($js, $mobile, $castoff);
        $js = preProcess($js, $mobile, $castoff);
    }
    return $js;
}

// "{@ident ... }@ident" -> ""
function stripCodeBlock($js, $mobile, $castoff) {
    $copiedArray = $castoff; // copy array
    if ($mobile) {
        $copiedArray[] = "mb"; // add "mb"
    }
    // cut off
    //      {@ident
    //          ...
    //      }@ident
    foreach ($copiedArray as $value) {
        $js = preg_replace('/\{@' . $value . '(?:[^\n]*)\}@'      . $value . '/',   '', $js);
        $js = preg_replace('/\{@' . $value . '(?:[^\n]*)\n.*?\}@' . $value . '/ms', '', $js);
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
    global $compiler, $verbose, $catfood, $mobile, $libraryCore,
           $loadedFileSize, $perfPoint, $outputDir, $forceOutputFileName,
           $memento, $compileOption;

    $command = '';

    // strip file extension
    $outfile = preg_replace('/\.[\w\.]+$/', '', $libraryCore);
    $outfile .= $mobile ? '.mb.js'
                        :    '.js';
    if ($forceOutputFileName) {
        $outfile = $forceOutputFileName;
    }

    switch ($compiler) {
    case "g":
//      $options = '--warning_level VERBOSE ';
        $command = 'java -jar tool.g.jar ' . $options . ' --js ' . $catfood
                 . ' --js_output_file ' . $outputDir . $outfile;
        break;
    case "G":
        $options = '--compilation_level ADVANCED_OPTIMIZATIONS ';
        $command = 'java -jar tool.g.jar ' . $options . ' --js ' . $catfood
                 . ' --js_output_file ' . $outputDir . $outfile;
        break;
    case "y":
        $options = '--charset "utf-8" ';
        $command = 'java -jar tool.y.jar -v ' . $options . ' -o ' . $outputDir
                 . $outfile . ' ' . $catfood;
        break;
    case "m":
        $command = 'tool.m.exe -w5 -hc ' . $catfood . ' -o ' . $outputDir
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
        $fz = filesize($outputDir . $outfile);

        printf("minified: %.02fk(%d)byte / %.02fk(%d)byte = %.02f%%, elapsed: %.02f(sec) \n",
              $fz / 1024, $fz, // minified size
              $loadedFileSize / 1024, $loadedFileSize, // source size
              ($fz / ($loadedFileSize + 1)) * 100, // size optimization
              time() - $perfPoint); // elapsed time
    }

    if ($memento) { // -memento
        $str = file_get_contents($outputDir . $outfile);

        $fp = fopen($outputDir . $outfile, 'w');
        fwrite($fp, "// compile option: " . $compileOption . "\n");
        fwrite($fp, $str . "\n");
        fclose($fp);
    }
}

// --- init ---
$slash = isWindows() ? '\\' : '/';

// --- memento compile option ---
$compileOption = implode(" ", $argv);

// --- reading commandline args ---
array_shift($argv);

while ($v = array_shift($argv)) {
    switch ($v) {
    case "-o":      $forceOutputFileName = array_shift($argv); break;
    case "-memento":$memento = true; break;
    case "-g":      $compiler = "g"; break;
    case "-G":      $compiler = "G"; break;
    case "-y":      $compiler = "y"; break;
    case "-m":      $compiler = "m"; break;
    case "-mb":     $mobile  = true; break;
    case "-v":      $verbose = true; break;
    case "-pp":     $preprosess = array_shift($argv); break;
    case "-lib":    $libraryCore = array_shift($argv);
                    $inputFiles = array($libraryCore); break;
    case "-src":    $sourceDir  = array_shift($argv); break;
    case "-out":    $outputDir  = array_shift($argv);
                    $catfood    = $outputDir . "catfood.js"; // rebuild
                    break;
    case "-off":    $castoff = explode("/", array_shift($argv)); break;
    default:        if (!in_array($v, $inputFiles)) {
                        $inputFiles[] = $v;
                    }
    }
}
$catfood = $outputDir . $catfood; // rebuild

if ($castoff[0] === "all") {
    $castoff = $castoffAll; // copy array
}
$castoff[] = "debug";
$castoff[] = "assert";

include $preprosess; // include js.php

loadFiles($inputFiles);
minify();

?>
