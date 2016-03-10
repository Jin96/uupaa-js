

# uu.env - properties #

  * uu.env.library - Number: uupaa.js のバージョン番号です。
    * 0.81 は major=0, minor=8, revision=1 を表現しています。
  * uu.env.ssl - Boolean: https スキームで true になります。これは( location.protocol === "https:" )と等価です。
  * uu.env.lang - String: ブラウザが選択したページ表示用の言語( "en" や "ja" )を文字列で返します。
  * uu.env.render - Number: レンダリングエンジンのバージョンを返します。http://d.hatena.ne.jp/uupaa/20090603
  * uu.env.browser - Number: ブラウザのバージョンを返します。 http://d.hatena.ne.jp/uupaa/20090603

  * uu.env.ie - Boolean: Internet Explorer で true になります。
  * uu.env.ie6 - Boolean: Internet Explorer 6 で true になります。
  * uu.env.ie7 - Boolean: Internet Explorer 7 で true になります。
  * uu.env.ie8 - Boolean: Internet Explorer 8 で document.documentMode が 8 なら true になります。IE5,IE7互換表示モードでは false になります。
  * uu.env.ie9 - Boolean: Internet Explorer 9 で document.documentMode が 9 なら true になります。IE5,IE7,IE8互換表示モードでは false になります。
  * uu.env.ie678 - Boolean: Internet Explorer 6～8 true になります。
  * uu.env.opera - Boolean: Opera, Opera Mini で true になります。
  * uu.env.gecko - Boolean: Gecko ベースのブラウザ(Firefox等)で true になります。
  * uu.env.webkit - Boolean: WebKit ベースのブラウザ(Safari, iPhone, iPad, iPod, Android,  Google Chrome等)で true になります。
  * uu.env.chrome - Boolean: Google Chrome で true になります。
  * uu.env.safari - Boolean: Safari, iPhone, iPad, iPod, Android で true になります。
  * uu.env.longedge - Number: 画面の長辺を数値で返します。1024 x 600 のデバイスでは 1024 を返します。
  * uu.env.ipad - Boolean: iPad で true になります。
  * uu.env.iphone - Boolean: iPhone / iPod で true になります。
  * uu.env.ios - Boolean: iPad / iPhone / iPod で true になります。
  * uu.env.retina - Boolean: Retina Display で true になります。iPhone 4 以上の判別にも利用できます。
  * uu.env.android - Boolean: Android で true になります。
  * uu.env.mbosver - Number: モバイルOSのバージョンを数値(major.minor)で返します。iOS 3.1.3 は mbosver = 3.13 になります。該当しないデバイスでは 0 を返します。
  * uu.env.slate - Boolean: モバイルデバイスで石版状の大型端末なら true になります。iPad なら true になり、Androidで長辺が961ピクセル以上の場合も true になります。
  * uu.env.mobile - Boolean: iOS, Android, Opera Mini で true になります。
    * Windows Phone, Mobile Firefox(Fennec) では現在のところ false になります。
  * uu.env.touch - Boolean: iOS, Android で true になります。
    * Windows Phone, Mobile Firefox(Fennec) では現在のところ false になります。
  * uu.env.os - String: "ios", "android", "windows", "mac", "unix", "chrome", "unknown" を返します。
  * uu.env.jit - Boolean: IE9+, Firefox3.5+, Safari4+, Google Chrome, Opera10.50+ で true になります。
  * uu.env.flash - Number: FlashPlayer のバージョン番号です。0 または 9以上の値になります。
    * FlashPlayer が利用できないか、version 8以下がインストールされている場合は 0 になります。
  * uu.env.silverlight - Number: Silverlight のバージョン番号です。0 または 3以上の値になります。
    * Silverlight が利用できないか、version 2以下がインストールされている場合は 0 になります。


## 例 ##

o = true, x/space = false
|                 |   IE6     | IE9pp2   | Mac Safari4 | iPhone3GS(OS4.x) | Windows Google Chrome5 | Ubuntu Firefox3.6 | Windows Opera10.50 |
|:----------------|:----------|:---------|:------------|:-----------------|:-----------------------|:------------------|:-------------------|
| uu.env.ie       |   o       |   o      |             |                  |                        |                    |                    |
| uu.env.ie6      |   o       |          |             |                  |                        |                    |                    |
| uu.env.ie7      |           |          |             |                  |                        |                    |                    |
| uu.env.ie8      |           |          |             |                  |                        |                    |                    |
| uu.env.ie9      |           |   o      |             |                  |                        |                    |                    |
| uu.env.opera    |           |          |             |                  |                        |                    |        o           |
| uu.env.gecko    |           |          |             |                  |                        |      o             |                    |
| uu.env.webkit   |           |          |     o       |        o         |       o                |                    |                    |
| uu.env.chrome   |           |          |             |                  |       o                |                    |                    |
| uu.env.safari   |           |          |     o       |        o         |                        |                    |                    |
| uu.env.retina   |           |          |             |    o(iPhone4)    |                        |                    |                    |
| uu.env.iphone   |           |          |             |        o         |                        |                    |                    |
| uu.env.android  |           |          |             |                  |                        |                    |                    |
| uu.env.mobile   |           |          |             |        o         |                        |                    |                    |
| uu.env.touch    |           |          |             |        o         |                        |                    |                    |
| uu.env.os       |"windows"  |"windows" |   "mac"     |    "ios"         |  "windows"             |   "unix"           |    "windows"       |
| uu.env.jit      |           |    o     |     o       |        o         |       o                |      o             |        o           |
| uu.env.browser  |   6       |    9     |     4       |        4         |      5                 |      3.6           |        10.5        |
| uu.env.render   |   0       |    0     |  531.227    |       531.211    |    533.8               |     1.92           |       2.524        |

# uu.env - methods #
  * uu.env.valueOf() - Number: uu.env.browser を返します。
    * if (uu.env.ie && uu.env < 9) {} とすると、uu.env.valueOf()が自動的に評価され、if (uu.env.ie6 `||` uu.env.ie7 `||` uu.env.ie8) {} と同じ結果になります。if (uu.ie678) {} でも同じ結果になります。

# uu.ver について #
uu.env と uu.ver は同じものです。uu.ver は廃止予定です。

## IE6, IE7 用の処理を行う ##
```
    if (uu.env.ie && uu.env < 8) {
        ...
    }
```

## Mac Safari 用の処理を行う ##
```
    if (uu.env.safari && uu.env.os === "mac") {
        ...
    }
```

## iPhone OS4.x 以上と OS3.x で処理を切り分ける ##
```
    if (uu.env.iphone) {
        if (uu.env.render > 530) {
            // iPhone4 and later
        } else {
            // iPhone3
        }
    }

    このように記述しても同じ結果を得られます。

    if (uu.env.retina) {
        // iPhone4 and later
    } else {
        // iPhone3
    }
```

## Slate(iPad や Android端末の一部) 用の処理を行う ##
```
    if (uu.env.slate) {
        ...
    }
```


# Test Code #
http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/env.htm