<?php
  function isWin() {
    return substr(PHP_OS, 0, 3) == 'WIN';
  }

  // clean dir
  function unlinks($dir) {
    if (is_dir($dir)) {
      $dp = dir($dir);
      while (false !== ($fname = $dp->read())) {
        if ($fname === '.' || $fname === '..') { continue; }
        if (!unlink("$dir/$fname")) {
          ;
        }
      }
      $dp->close();
    }
  }

  // copy to tmp dir(+ header)
  function tmpcopy($src, $dest, $header) {
    $txt = file_get_contents($src);
    $fp  = fopen($dest, 'w');
    fwrite($fp, $header);
    fwrite($fp, $txt);
    fclose($fp);
  }

  function buildFeatures($package, $fileName, $verbose, $win) {
    $ary = file($package, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $verbose = $verbose ? "-v" : "";
//echo "Array.length = ", count($ary);

    $fp = fopen($fileName, 'w');
    !$fp and die("error");

    // echo date
    fwrite($fp, "echo " . date("Y-m-d H:i:s") . " > build.log \n");

    $txt = '';
    $v = '';
    foreach($ary as $key => $value) {
      if (preg_match('/^\/\//', $value)) { // skip comment line
        continue;
      }
      $v = rtrim($value);
      $txt = "echo {$v}>> build.log \n";
      if ($verbose) {
        if ($v === "core.js") {
          copy("../src/{$v}", "./tmp/{$v}");
        } else {
          tmpcopy("../src/{$v}", "./tmp/{$v}", "if(!uu){var uu,UU;}\n");
        }
        $txt .= "java -jar yuicompressor.jar {$verbose} --charset \"utf-8\" --line-break 800 -o bin/{$v} tmp/{$v} >> build.log 2>&1 \n";
      } else {
        $txt .= "java -jar yuicompressor.jar {$verbose} --charset \"utf-8\" -o bin/{$v} ../src/{$v} >> build.log 2>&1 \n";
      }
      fwrite($fp, $txt);
    }
    fwrite($fp, "php build.php {$package}\n");
    if ($win) {
      fwrite($fp, "exit\n"); // close DOS window
    }
    fclose($fp);
    //
    // echo "- create file: {$package}\n";
  }

  function buildScripts($package, $fileName, $release) {
    $ary = file($package, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    $fp = fopen($fileName, 'w');
    !$fp and die("error");

    $credit = file_get_contents("credit.txt");
    $header = file_get_contents("header.txt");
    $footer = file_get_contents("footer.txt");
    $txt = "";
    if ($release) {
      $txt = $credit . preg_replace('/\s*/', '', rtrim($header)); // trim space
    } else {
      $txt = $credit . $header;
    }

    $v = '';
    foreach($ary as $key => $value) {
      if (preg_match('/^\/\//', $value)) { // skip comment line
        continue;
      }
      $v = rtrim($value);
      if ($release) {
        $txt .= file_get_contents("bin/{$v}");
      } else {
        $txt .= file_get_contents("../src/{$v}") . "\n\n";
      }
    }
    if ($release) {
      $txt .= preg_replace('/\s*/', '', rtrim($footer)); // trim space
    } else {
      $txt .= $footer;
    }
    fwrite($fp, $txt);
    fclose($fp);
  }
?>
