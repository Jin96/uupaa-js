
usage:
  >uap.php [-g | -m | -y] [-mb] [-v] [-pp file] [-src dir] [-core file] [*.js ...]

        -g    use Google Closure Compiler (default)
        -m    use Microsoft Ajax Minifier
        -y    use YUI Compressor
        -mb   Mobile WebKit Mode
                {{{!mb ～ }}}!mb を削除します
                生成されるコードは MobileWebKit(iPhone,iPad, iPod)専用になります。
                {$libraryCore} に指定されたファイルを別個にビルドします(最大で2回ビルドします)。
        -v    verbose mode. ビルド対象一覧を表示します。ビルド結果を表示し一時停止します。
        -pp   preprocessor file. プロプロセスで使用するPHPコードを指定します。デフォルトは "js.php" です。
        -src  source directory. ソースコードの読み込む基準ディレクトリを指定します。デフォルトは "../src/" です。
        -core library core. ライブラリの核となるファイルを指定します。デフォルトは "uupaa.js" です。
              ビルドで生成するファイル名も -core で指定したファイル名になります。
        *.js  JavaScriptソースコードファイルパスです。
              相対パスで指定した場合は {$sourceDir} 以下からファイルを読み取ります。


  1. JavaScriptソースコードをビルドする。
     src.js を相対パスで指定しているため {$sourceDir}/src.js が読み取られる

          >upa src.js

  2. 複数のソースコードを結合し一つのファイルにビルドする

          >upa a.js b.js c.js

  3. iPhone/iPad用にビルドする。生成されるファイルは uupaa.mb.js と uupaa.mb2.js

          >upa src.js -mb

  4. Microsoft Ajax Minifier でビルドする(Windows環境のみ)

          >upa src.js -m

  5. YUI Compressor でビルドする

          >upa src.js -y

  6. -core でライブラリコアを指定してビルドする。生成されるファイルは anotherLibrary.js

          >upa src.js -core anotherLibrary.js

  7. -pp でプリプロセス用のPHPコードを指定してビルドする

          >upa src.js -pp c.pp
