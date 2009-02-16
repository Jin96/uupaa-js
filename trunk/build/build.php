<?php
  // usage:
  //  "build package"
  require_once("misc.php");

  $package = $argv[1];
  buildScripts($package, "../uupaa.{$package}.js", 1);
?>
