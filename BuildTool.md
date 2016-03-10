

# Build Tool (upa.php) #

build/upa.php は 幾つかの JavaScript ソースコードを読み込み、結合、プリプロセスとMinifyを行い、最適化済みの JavaScript 実行ファイルを生成します。

upa.php `[`**-g** `|` -m `|` -y`] [`-v`] [`-memento`] [`-pp _file_`] [`-src _dir_`] [`-out _dir_`] [`-o _file_`] [`-lib _file_`] [`-mb`] [`-off _ident_`[`/_ident_`[`/..`]]] [`_`*`.js_ ...`]`

## #include ##
upa.php は JavaScript ソースコード内に、include 文 `#include` _sourcecode_ を見つけるとファイルを読み込みその場に展開します。

#include 文をそのまま記述すると JavaScript の構文エラーになるため、先頭に一行コメントを追加し以下のように記述します。ソースコードパスが空白や記号を含む場合は前後をクォートで囲みます。
```
//#include sourcecode.js

//#include "source code.js"

//#include 'source + code.js'
```


## 導入 ##

### Windows でビルドする ###
  * Java Runtime をインストールします。既にインストールされている場合は不要です。
  * .NET Framework をインストールします。既にインストールされている場合は不要です。
  * PHP CLI をインストールします。XAMPP を代わりにインストールしてもよいでしょう。
  * `[コントロールパネル]-[システム]-[詳細設定]-[環境変数]-[システム環境変数]-[Path]`の末尾に C:\xampp\php; を追加します。
  * build/dos.bat をダブルクリックするとコマンドプロンプトが起動します。 upa -v とタイプしエラーがでなければビルド可能な状態です。

### Mac OS X / Ubuntu でビルドする ###
  * Java Runtime をインストールします。既にインストールされている場合は不要です。
  * PHP CLI をインストールします。既にインストールされている場合は不要です。
```
  $sudo apt-get update
  $sudo apt-get install php5-cli
```
  * ターミナル build ディレクトリに移動し、php -f upa.php -v とタイプしエラーがでなければビルド可能な状態です。

| **-g**     | use Google Closure Compiler | (default) |
|:-----------|:----------------------------|:----------|
| -m         | use Microsoft Ajax Minifier |           |
| -y         | use YUI Compressor          |           |
| -v         | verbose mode                | ビルド対象一覧を表示します。ビルド結果を表示し一時停止します |
| -memento   | memento compile option      | 圧縮後のコードの先頭行にコンパイルで使用したコマンドラインオプションを挿入します<br />// compile option: upa.php -v -off all -memento |
| -pp        | preprocessor file           | プロプロセスで使用するPHPコードを指定します。通常のビルドでは指定しません。デフォルトは "js.pp" です |
| -src       | source directory            | ソースコードを読み込む基準ディレクトリを指定します。デフォルトは "../src/" です |
| -out       | output directory            | 出力先ディレクトリを指定します。デフォルトは "../js/" です |
| -o         | output file name            | 出力するファイル名を指定します。デフォルトは "uupaa.js" です。-lib オプションと同時に指定した場合は -o で指定したファイル名が優先されます |
| -lib       | library core                | ライブラリの核となるファイルを指定します。デフォルトは "uupaa.js" です。<br /> ビルドで生成するファイル名は -lib または -o(こちらを優先) で指定したファイル名になります |
| -mb        | Mobile WebKit Mode          | `{{{`!mb ～ `}}}`!mb を削除します <br /> 生成されるコードは MobileWebKit(iPhone,iPad, iPod, Android)専用になり、拡張子が .mb.js になります |
| -off       | castoff                     | コメントアウトする機能名をスラッシュで連結し指定します。例: -off form/snippet |
| _`*`.js_   | JavaScript source code file path | ソースコードのファイルパスを指定します。相対パスで指定した場合は -src 以下からファイルを読み取ります |

## -off ##
> -off オプションに指定可能な文字列の一覧です。複数の ident を指定する場合はスラッシュで連結します。
```
upa -off color/ui/codec
```
| **ident**   | 説明 | 削減されるファイルサイズ<br />(Minify適用後の値) |
|:------------|:---|:--------------------------------|
| all         | 以下の機能を一括でコメントアウトします。 | ---                             |
| form        | uu.form(), NodeSet.value() をコメントアウトします | -0.9kB                          |
| snippet     | uu.snippet() をコメントアウトします | -0.7kB                          |
| image       | uu.image() をコメントアウトします | -1.0kB                          |
| color       | uu.color() をコメントアウトします。<br />uu.fx でカラーアニメーションが利用できなくなります | -6.2kB                          |
| colordict   | 色辞書をコメントアウトします。<br />uu.color() は利用可能ですが<br /> "black" や "skyblue" などの W3C Named Color は利用できなくなります | -2.3kB                          |
| test        | uu.ok(), uu.ng() をコメントアウトします。| -1.5kB                          |
| fx          | uu.fx() をコメントアウトします。<br />uu.css.show() と uu.css.hide() も利用できなくなります | -7.6kB                          |
| ajax        | uu.ajax(), uu.jsonp() をコメントアウトします。| -2.8kB                          |
| svg         | uu.svg() をコメントアウトします | -0.2kB                          |
| geo         | uu.geo() をコメントアウトします | -0.7kB                          |
| canvas      | uu.canvas() をコメントアウトします | -59.0kB                         |
| flash       | uu.flash() をコメントアウトします | -0.6kB                          |
| cookie      | uu.cookie(), uu.Class.CookieStorage をコメントアウトします | -1.0kB                          |
| storage     | uu.Class.Storage をコメントアウトします。<br />uu.storage は null になり利用できなくなります。 | -4.3kB                          |
| nodeset     | NodeSet I/F 全体をコメントアウトします。<br /> uu("div > p").add("div") などが利用できなくなります | -1.7kB                          |
| live        | uu.live(), uu.unlive(), NodeSet.live(), NodeSet.unlive() をコメントアウトします | -1.2kB                          |
| eventresize | uu.event.resize(), uu.event.unresize() をコメントアウトします | -0.8kB                          |
| eventcyclic | uu.event.cyclic(), uu.event.uncyclic() をコメントアウトします | -0.3kB                          |
| cssbox      | uu.css.box(), uu.css.rect(), <br />uu.css.toStatic(), uu.css.toAbsolute(), uu.css.toRelative() をコメントアウトします | -1.7kB                          |
| codec       | uu.entity(), uu.base64(), <br />uu.utf8(), uu.md5(), uu.sha1(), uu.hmac() をコメントアウトします。<br />uu.ok() が使用できなくなります。 | -8.0kB                          |
| md5         | uu.md5() をコメントアウトします | -1.6kB                          |
| sha1        | uu.sha1() をコメントアウトします | -0.7kB                          |
| hmac        | uu.hmac() をコメントアウトします | -0.2kB                          |
| sprintf     | uu.sf(), uu.sprintf() をコメントアウトします | -0.8kB                          |
| ui          | uu.ui() をコメントアウトします | -7.2kB                          |
| preload     | 画像のプリロード処理をコメントアウトします | -0.1kB                          |
| assert      | ビルド時に自動的にコメントアウトします |                                 |
| debug       | ビルド時に自動的にコメントアウトします |                                 |

# 例 #
各オプションの利用方法について説明します。

## uupaa.js に他の複数のライブラリ/プラグインを同梱した状態でビルドする ##
  * upa lib.js plugin.js
> 3つのファイル(../src/uupaa.js, ../src/lib.js, ../src/plugin.js) を結合し、../js/uupaa.js を生成します。

## iPhone/iPad用にビルドする ##
  * upa -mb
> ../src/uupaa.js を読み込み ../js/uupaa.mb.js を生成します。

## iPhone/iPad用に最小構成でビルドする ##
  * upa -mb -off form/snippet/image/color
> ../src/uupaa.js を読み込み ../js/uupaa.mb.js を生成します。
> この例では uu.form(), uu.snippet(), uu.image(), uu.color() 等が利用できなくなります。不要な機能を削減しファイルサイズを最小化できます。

## ビルドオプションを記録する ##
  * upa -v -memento -off canvas/storage a.js
> ../src/uupaa.js と ../src/a.js を読み込み ../js/uupaa.js を生成します。
> ../js/uupaa.js の先頭行は
> ` // compile option: upa -v -memento -off canvas/storage a.js ` になります。

## Microsoft Ajax Minifier でビルドする(Windows環境のみ) ##
  * upa -m

## YUI Compressor でビルドする ##
  * upa -y

## -lib で uupaa.js 以外のライブラリをビルドする ##
  * upa -lib prototype.js
> ../src/prototype.js を読み込み ../js/prototype.js を生成します。

## -pp でプリプロセス用のPHPコードを指定してビルドする ##
  * upa c.js -pp c.pp
> 擬似 c コードを JavaScript のコードにコンバートする

# 中間ファイル(catfood.js) #
Minify直前の状態(ソースを結合状態)の中間ファイルを {$out}/catfood.js というファイル名で生成します。
ビルド時のエラーや警告は catfood.js と対応しています。