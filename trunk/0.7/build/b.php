<?php

// marge and strip comment
function marge($packagefile, $outfile, $minify) {
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
    if ($minify) {
      // \r\n -> \n
      $txt = preg_replace('/(\r\n|\r|\n)/m', "\n", $txt);
      // strip comment line
      $txt = preg_replace('/(^|\s)\/\/[^\n]*$/m', '', $txt);
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
      // sorry evil...
      $txt = preg_replace('/^                                /m', "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t", $txt);// 32sp -> 16tb
      $txt = preg_replace('/^                              /m', "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t", $txt);// 30sp -> 15tb
      $txt = preg_replace('/^                            /m', "\t\t\t\t\t\t\t\t\t\t\t\t\t\t", $txt);// 28sp -> 14tb
      $txt = preg_replace('/^                          /m', "\t\t\t\t\t\t\t\t\t\t\t\t\t", $txt);// 26sp -> 13tb
      $txt = preg_replace('/^                        /m', "\t\t\t\t\t\t\t\t\t\t\t\t", $txt);// 24sp -> 12tb
      $txt = preg_replace('/^                      /m', "\t\t\t\t\t\t\t\t\t\t\t", $txt);// 22sp -> 11tb
      $txt = preg_replace('/^                    /m', "\t\t\t\t\t\t\t\t\t\t", $txt);// 20sp -> 10tb
      $txt = preg_replace('/^                  /m', "\t\t\t\t\t\t\t\t\t", $txt);// 18sp -> 9tb
      $txt = preg_replace('/^                /m', "\t\t\t\t\t\t\t\t", $txt);// 16sp -> 8tb
      $txt = preg_replace('/^              /m', "\t\t\t\t\t\t\t", $txt);// 14sp -> 7tb
      $txt = preg_replace('/^            /m', "\t\t\t\t\t\t", $txt);// 12sp -> 6tb
      $txt = preg_replace('/^          /m', "\t\t\t\t\t", $txt);// 10sp -> 5tb
      $txt = preg_replace('/^        /m', "\t\t\t\t", $txt);  // 8sp -> 4tab
      $txt = preg_replace('/^      /m', "\t\t\t", $txt);      // 6sp -> 3tab
      $txt = preg_replace('/^    /m', "\t\t", $txt);          // 4sp -> 2tab
      $txt = preg_replace('/^  /m', "\t", $txt);              // 2sp -> 1tab

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
function isWin() {
  return substr(PHP_OS, 0, 3) == 'WIN';
}

// usage:
//  "b.php [package] [-g | -y | -m | -j]"
$v = "";
$minify = 1;
$package = "full";
$outfile = isWin() ? "..\\uupaa.js" : "../uupaa.js";
$compiler = "y";
$command = "";

array_shift($argv);
while ($v = array_shift($argv)) {
  switch ($v) {
  case "-j":
    $minify = 0;
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
  default:
    $package = $v;
    break;
  }
}
$packagefile = '#' . $package . '.pkg'; // "#full.pkg"

marge($packagefile, $outfile, $minify);

switch ($compiler) {
case "g":
  $command = 'java -jar lib.g.jar --js=' . $outfile . ' --js_output_file=mini.'
           . $package . '.g.js';
  break;
case "y":
  $command = 'java -jar lib.y.jar --charset "utf-8" -o mini.'
           . $package . '.y.js ' . $outfile;
  break;
case "m":
  $command = 'lib.m.exe -w5 -hc ' . $outfile . ' -o mini.'
           . $package . '.m.js';
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
