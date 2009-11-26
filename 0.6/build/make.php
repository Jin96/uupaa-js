<?php
  // usage:
  //  "make [package] [verbose] [release] [clean]"
  require_once("misc.php");

  $v = "";
  $package = "test";
  $release = 0;
  $verbose = 0;
  $win = isWin();

  array_shift($argv);
  while ($v = array_shift($argv)) {
    switch ($v) {
    case "verbose":
    case "-v":
      $verbose = 1;
      break;
    case "release":
    case "-r":
      $release = 1;
      break;
    case "clean":
      unlink("build.bat");
      unlink("build.log");
      unlinks("bin");
      unlinks("tmp");
      return;
    default:
      $package = $v;
      break;
    }
  }

  echo "- package: {$package}\n";
  echo "- release: {$release}\n";
  echo "- verbose: {$verbose}\n";
  $fileName = "../uupaa.{$package}.js";

  if ($release) {
    buildFeatures($package, "build.bat", $verbose, $win);
    if ($win) {
      shell_exec("start build.bat");
    } else {
      shell_exec("build.bat");
    }
  } else {
    buildScripts($package, $fileName, $release);
  }
  echo "- create file: {$fileName}\n";
?>
