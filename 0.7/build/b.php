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

// marge and strip comment
function marge($packagefile, $outfile, $minify, $optimize) {
  $dir = isWin() ? '..\\' : '../';
  $ary = file($packagefile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  $fp = fopen($outfile, 'w');
  !$fp and die($outfile . " file open fail");

  foreach($ary as $value) {
    // skip blank and C++ comment line
    if (preg_match('/^\s*$/', $value) || // blank
        preg_match('/^\/\//', $value)) { // C++ comment
      continue;
    }
    $src = trim($value);
    $txt = file_get_contents($dir . $src);

    // \r\n(CRLF) -> \n(LF)
    $txt = preg_replace('/(\r\n|\r|\n)/m', "\n", $txt); // \r = x0d = CR, \n = x0a = LF

    if (!array_key_exists('debug', $optimize)) { // {{{!debug ～ }}}!debug
      $txt = preg_replace('/\{\{\{\!debug([^\n]*)\n.*?\}\}\}\!debug/ms', '', $txt);
    }
    if (array_key_exists('mb', $optimize)) { // {{{!mb ～ }}}!mb
      $txt = preg_replace('/\{\{\{\!mb([^\n]*)\n.*?\}\}\}\!mb/ms', "/*{{{!mb$1 }}}!mb*/", $txt);
    }
    if ($minify) {
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
      $txt = preg_replace('/(\w+):\s+(uu\.?\w+)/m', "$1: $2", $txt); // xxx: uuxxx
      $txt = preg_replace('/(\w+):\s+(jam\w+)/m', "$1: $2", $txt); // xxx: jamxxx
      $txt = preg_replace('/(\w+):\s+(bite\w+)/m', "$1: $2", $txt); // xxx: bitexxx
      $txt = preg_replace('/(\w+):\s+(_\w+)/m', "$1: $2", $txt);   // xxx: _xxx
      $txt = preg_replace('/(\w+):\s+\{\}/m', "$1: {}", $txt);     // xxx: {}
      $txt = preg_replace('/(\w+):\s+0/m', "$1: 0", $txt);         // xxx: 0

      // "  " -> "\t"
      $txt = preg_replace_callback('/^[ ]{4,}/m', sp2tab, $txt); // 4space -> 1tab

      // function(arg,
      //          arg,       ->  function(arg, arg, arg)
      //          arg)
      $txt = preg_replace('/\((\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/', "($1, $2, $3, $4, $5, $6)", $txt);
      $txt = preg_replace('/\((\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/', "($1, $2, $3, $4, $5)", $txt);
      $txt = preg_replace('/\((\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/', "($1, $2, $3, $4)", $txt);
      $txt = preg_replace('/\((\w+),\n\s+(\w+),\n\s+(\w+)\)/', "($1, $2, $3)", $txt);
      $txt = preg_replace('/\((\w+),\n\s+(\w+)\)/', "($1, $2)", $txt);
    }
    fwrite($fp, $txt);
    fwrite($fp, "\n");
  }
  fclose($fp);
}
function sp2tab($m) { // "    " -> "\t"
  $lz = mb_strlen($m[0]);
  return str_repeat("\t", $lz / 4) . ($lz % 4 ? " " : "");
}
function isWin() {
  return substr(PHP_OS, 0, 3) == 'WIN';
}

$v = "";
$minify = 1;
$package = "full";
$outfile = isWin() ? "..\\uupaa.js" : "../uupaa.js";
$options = '';
$compiler = "y";
$command = "";
$optimize = array();

array_shift($argv);
while ($v = array_shift($argv)) {
  switch ($v) {
  case "-j":
 // $minify = 0;
    $compiler = "";
    break;
  case "-g":
    $compiler = "g";
    break;
  case "-y":
    $compiler = "y";
    break;
  case "-m":
    $compiler = "m";
    break;
  case "-mb":
    $optimize["mb"] = ".mb";
    break;
  case "-debug":
    $optimize["debug"] = ".debug";
    break;
  case "-out":
    $outfile = isWin() ? "..\\" : "../";
    $outfile = $outfile . array_shift($argv);
    break;
  default:
    $package = $v;
    break;
  }
}
ksort($optimize); // ["mb"=>".mb", "debug"=>".debug"] -> ["debug"=>".debug", "mb"=>".mb"]

$packagefile = '#' . $package . '.pkg'; // "#full.pkg"

marge($packagefile, $outfile, $minify, $optimize);

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
echo "- package: {$packagefile}\n";
echo "- command: {$command}\n";

if ($compiler) {
  if (isWin()) {
    $fp = fopen('mini.bat', 'w');
    fwrite($fp, $command . "\n");
    fwrite($fp, "pause\n");
    fwrite($fp, "exit\n");
    fclose($fp);
    shell_exec('start mini.bat');
    unlink('mini.bat');
  } else {
    shell_exec($command);
  }
}

?>
