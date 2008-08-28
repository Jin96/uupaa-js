/** <b>Perry Module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var /* uud = document, */ uuw = window, uu = uuw.uu;

uu.module.perry = {};

/** <b>Perry</b>
 *
 * ペリーさんは「日本に来たばかりの外国人」をコンセプトに、
 * Windows2000以上でOSに標準で搭載されているText-To-Speech Engine(ActiveX)を酷使して、
 * おしゃべりするジョークソフトです。<br /><br />
 *
 *  <dl>
 *    <dt>IE</dt><dd>IE5.5以上であれば最初から使用可能です。</dd>
 *    <dt>Firefox</dt>
 *      <dd>Firefoxで動作させるには、二種類の方法があります。<br />
 *          方法1. <a href="https://addons.mozilla.org/ja/firefox/addon/1419">IE Tab</a>をインストールし, 描画エンジンをIEに切り替えてActiveXを使用します。<br />
 *          方法2. <a href="http://www.iol.ie/~locka/mozilla/plugin.htm">Mozilla ActiveX Controls</a>にあるFirefox 1.5用のxpiをインストールし(Firefox2でも1.5用のxpiが使えます)、
 *           C:\Program Files\Mozilla Firefox\defaults\pref\activex.js に以下の行を追加しFirefoxを再起動します。<br />
 *           <pre class="eg">
 *             // SAPI.SpVoice
 *             pref("capability.policy.default.ClassID.CID96749377-3391-11D2-9EE3-00C04F797396", "AllAccess");
 *           </pre>
 *           詳細は、<a href="http://www.google.co.jp/search?q=firefox activex xpconnect global hosting_flags">activex xpconnect global hosting_flags</a> で検索してください。</dd>
 *    <dt>Opera</dt>
 *      <dd><a href="http://www.opera.com/support/search/view/415/">ActiveX support in Opera</a>をインストールすると、Operaの中でIEの描画エンジンが利用可能になります。</dd>
 *    <dt>Safari</dt>
 *      <dd>動作させる方法が不明です</dd>
 *  </dl>
 *
 *  <h4>利用方法</h4>
 *  プレゼンのつかみに使ってみるとか、
 *  難読化された文字による認証(CHAPTA(チャプタ))の代わりに使って、
 *  日本人と偽日本人を区別するとか、かなぁ…。
 * 
 * @class
 */
uu.perry = function() {
};
uu.perry._obj = null;
uu.perry.dict = function() {
};

/** 辞書の追加 */
uu.perry.addDict = function(hash, type /* = "kanji" */) {
  if (type === "kanji") {
    uu.mix(uu.perry.dict.kanji, hash);
  } else if (type === "voice") {
    uu.mix(uu.perry.dict.voice, hash);
  }
};
/** delayタイマーID
 * @type number */
uu.perry._delayTimerID = -1;

/** 発声
 * @param String text - テキストを指定します。
 * @param Number [delay] - 遅延時間を指定します。単位はmsです。デフォルトは0です。
 */
uu.perry.say = function(text, delay) {
  if (uu.perry._delayTimerID !== -1) {
    clearTimeout(uu.perry._delayTimerID);
    uu.perry._delayTimerID = -1;
  }
  if (!uu.isS(text) || !text.length) { return; }
  uu.perry._delayTimerID = uuw.setTimeout(function() {
    uu.perry._say(text);
  }, delay);
};
uu.perry._say = function(text) {
  var rv = [], i, sz, v1, v2, v3, v4, v5, voice = uu.perry.dict.voice,
      ascii = 0;
  if (!uu.perry._obj) {
    try {
    uu.perry._obj = (uu.ua.ie)    ? new ActiveXObject("SAPI.SpVoice") :
                    (uu.ua.gecko) ? new GeckoActiveXObject("SAPI.SpVoice") : null;
    } catch (e) {
      throw Error("uu.perry.say(create ActiveXObject(\"SAPI.SpVoice\"))");
    }
  }
  if (!uu.perry._obj) { throw Error("uu.perry.say(create ActiveXObject(\"SAPI.SpVoice\"))"); }

  // 各メソッドで前処理
  for (i = 0, sz = uu.perry.method._chain.length; i < sz; ++i) {
    text = uu.perry.method._chain[i](text);
  }
  // カナ/ひらがな混じりのテキストを発声記号に変換
  text = (text + "     ").split("");
  for (i = 0, sz = text.length; i < sz; ++i) {
    v1 = text[i];
    if (v1 === " " || v1.match(/[a-zA-Z0-9\-_,\.\?]/)) { // スペースとアルファベットは変換しない
      if (!ascii) { // "のOSが" → "noOS ga" にならないよう、単語の区切りでスペースを挿入する
        rv.push(" ");
      }
      rv.push(v1);
      ascii = 1;
    } else {
      ascii = 0;
      // カナ(kana) → ひらがな(hiragana)
      v1 = kanaToHiragana(v1);
      v2 = v1 + kanaToHiragana(text[i + 1]);
      v3 = v2 + kanaToHiragana(text[i + 2]);
      v4 = v3 + kanaToHiragana(text[i + 3]);
      v5 = v4 + kanaToHiragana(text[i + 4]);
      if (v5 in voice) { rv.push(" ", voice[v5]); i += 4; } else
      if (v4 in voice) { rv.push(" ", voice[v4]); i += 3; } else
      if (v3 in voice) { rv.push(" ", voice[v3]); i += 2; } else
      if (v2 in voice) { rv.push(" ", voice[v2]); i += 1; } else
      if (v1 in voice) { rv.push(" ", voice[v1]); }
    }
  }
  // ドット(".")で段落を区切り、ブラウザの無反応時間を短くする。
  rv.join("").split(".").forEach(function(v) {
    window.status = v;
    uu.perry._obj.Speak(v);
  });

  function kanaToHiragana(str) {
    var hira = "ぁ".charCodeAt(0),
        p1 = "ァ".charCodeAt(0),
        p2 = "ヶ".charCodeAt(0),
        c = str.charCodeAt(0);
    return (c >= p1 && c <= p2) ? String.fromCharCode(c - (p1 - hira)) : str;
  }
};

uu.perry.method = function() {
};

/** 漢数字と全角数字の正規化
 *
 * "二百円" → "200円"
 */
uu.perry.method.japaneseNumberNormalize = function(str) {
  var me = arguments.callee, i = 0, sz = me._const.length;
  for (; i < sz; ++i) {
    if (str.match(me._const[i])) {
      str = str.replace(me._const[i], function(match) { return i; });
    }
  }
//  alert("japaneseNumberNormalize:" + str);
  return str;
};
uu.perry.method.japaneseNumberNormalize._const = [
  /([零〇０])/gm, /([壱一１])/gm, /([弐二２])/gm, /([参三３])/gm, /([四４])/gm,
  /([伍五５])/gm, /([六６])/gm,   /([七７])/gm,   /([八８])/gm,   /([九９])/gm,
  /([十拾])/gm,
];

/* 連続したカタカナを単語として認識させ、前後に "[" と "]" を付加する
 *
 * "26万文字の漢字とカタカナ" → "[26万文字]の[漢字]と[カタカナ]"
 *
 * この関数を通すと、"気晴らし" が "[気晴]らし" に分解されてしまい、うまくいかなくなる。
 */
uu.perry.method.japaneseClipWord = function(str) {
  var rv = str.replace(/([\u4e00-\ufa2d]{2,})/mg, "[$1]")  // "漢字": 最長一致(貪欲)
              .replace(/([\u30a1-\u30fe]{2,})/mg, "[$1]"); // "カナ": 最長一致(貪欲)
//  alert("japaneseClipWord:" + rv);
  return rv;
};

/** 助数詞を音読みとして展開する
 * 3兆円 → 300000000円
 */
uu.perry.method.japaneseNumberUnitize = function(str) {
  var me = arguments.callee, i = 0, sz = me._const.length;
  for (; i < sz; ++i) {
    if (str.match(me._const[i][0])) {
      str = str.replace(me._const[i][0], function(match, num, unit) {
        if (unit in me._const[i][1]) {
          return num + me._const[i][1][unit];
        }
        return num + unit;
      });
    }
  }
alert("japaneseNumberUnitize:" + str);
  return str;
};
uu.perry.method.japaneseNumberUnitize._const = [
  [/([0-9]+)(百|千|万|億|兆|京|戸|軒|棟|杯|体|本|基|着|羽|頭|玉|尾|番|丁|条|面|株|行|錠|足|手|俵|台|両|挺|通|頁|球|反|局|門|畳|巻|口|票|個|貫|斤|泊|人|名|対|冊|品|人前|位|種|点|転|部|匹)/gm,
    { "百": "ひゃく", "千": "せん",   "万": "まん",   "億": "おく",   "兆": "ちょう", "京": "けい",
      "戸": "こ",     "軒": "けん",   "棟": "とう",   "杯": "はい",   "体": "たい",
      "本": "ほん",   "基": "き",     "着": "ちゃく", "羽": "わ",     "頭": "とう",
      "玉": "たま",   "尾": "び",     "番": "ばん",   "丁": "ちょう", "条": "じょう",
      "面": "めん",   "株": "かぶ",   "行": "ぎょう", "錠": "じょう", "足": "そく",
      "手": "て",     "俵": "ぴょう", "台": "だい",   "両": "りょう", "挺": "ちょう",
      "通": "つう",   "頁": "ぺーじ", "球": "きゅう", "反": "たん",   "局": "きょく",
      "門": "もん",   "畳": "じょう", "巻": "かん",   "口": "くち",   "票": "ひょう",
      "個": "こ",     "貫": "かん",   "斤": "きん",   "泊": "はく",   "人": "にん",
      "名": "めい",   "対": "つい",   "冊": "さつ",   "品": "しな",   "人前": "にんまえ",
      "位": "い",     "種": "たね",   "点": "てん",   "転": "てん",   "部": "ぶ",
      "匹": "ひき"
    }
  ]
];

/** "漢字" → "[かんじ]" 変換
 * "食べる" → "[たべる]" などの送り仮名もここで辞書的に処理する
 */
uu.perry.method.japaneseKanji = function(str) {
  var rv = [], i = 0, sz,
      v1, v2, v3, v4, v5, s = (str + "    ").split(""),
      ary = uu.perry.dict.kanji;

  for (sz = s.length; i < sz; ++i) {
    v1 = s[i];
    if (v1 === " " || v1.match(/[a-zA-Z0-9\-_,\.\?]/)) {
      rv.push(v1);
    } else if (v1.match(/[「」『』【】]/)) { // 括弧の前で区切る
      rv.push(". ");
    } else {
      v2 = v1 + s[i + 1];
      v3 = v2 + s[i + 2];
      v4 = v3 + s[i + 3];
      v5 = v4 + s[i + 4];
      if (v5 in ary) { rv.push(ary[v5]); i += 4; } else
      if (v4 in ary) { rv.push(ary[v4]); i += 3; } else
      if (v3 in ary) { rv.push(ary[v3]); i += 2; } else
      if (v2 in ary) { rv.push(ary[v2]); i += 1; } else
      if (v1 in ary) { rv.push(ary[v1]); } else
                     { rv.push(v1); }
    }
  }
  return rv.join("");
};

/* "[" + {連続した漢字} + "]" を検索し、連続した漢字を、辞書を元に音読みのひらがなに変換する
 */
uu.perry.method.japaneseOnyomi = function(str) {
  var onyomi = uu.perry.dict.onyomi;
  return str.replace(/\[([\u4e00-\ufa2d]{2,}?)\]/mg, // "[漢字]": 非貪欲
    function(match, words) {
      // 最大4文字熟語を熟語単位で再分解し辞書引きする
      var rv = [], i = 0, s = words.split(""), v1, v2, v3, v4;
      for (; i < s.length; ++i) {
        v1 = s[i];
        v2 = v1 + s[i + 1];
        v3 = v2 + s[i + 2];
        v4 = v3 + s[i + 3];
        if (v4 in onyomi) { rv.push(onyomi[v4]); i += 3; } else
        if (v3 in onyomi) { rv.push(onyomi[v3]); i += 2; } else
        if (v2 in onyomi) { rv.push(onyomi[v2]); i += 1; } else
        if (v1 in onyomi) { rv.push(onyomi[v1]); } else
                        { rv.push(v1); }
      }
      return rv.join("");
    }
  );
};

/** 連続した数字を日本語読みに変換 */
uu.perry.method.japaneseSujiYomi = function(str) {
  var me = arguments.callee;
  return str.replace(RegExp("[0-9]+", "gm"), function(match) {
    var i = 0, rv = [], s = match.split(""), sz = s.length, tmp = "", remain = 0;
    for (; i < sz; ++i) {
      remain = sz - i;
      tmp = ((remain - 1) % 4 == 0) ? me._const[0][s[i]] : me._const[1][s[i]]; // 1, 5, 9...
      if (tmp.length) {
        rv.push(tmp);
        switch ((remain - 1) % 4) {
        case 0: break;
        case 1: rv.push("じゅう"); break; // remain = 2, 6
        case 2: rv.push((s[i] == 3) ? "びゃく" : "ひゃく"); break;
        case 3: rv.push((s[i] == 3) ? "ぜん" : "せん"); break;
        }
      }
      switch (remain - 1) {
      case  4: rv.push("まん"); break;
      case  8: rv.push("おく"); break;
      case 12: rv.push("ちょう"); break;
      case 16: rv.push("けい"); break;
      }
    }
    return rv.join("");
  });
};
uu.perry.method.japaneseSujiYomi._const = [
  ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"],
  ["", " ", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"]
];

/* 分かち書き、文節を認識させ、前後に "[" と "]" を付加する
 * 文章は適切に漢字カナ交じりの状態とする。
 *
 * ダメな例: "まのびしたかいわ。" → "[まの][びしたかいわ。]"
 * うまく行く例: "間延びした会話。" → "[間延びした会話。]"
 */
uu.perry.method.japaneseWakachigaki = function(str) {
  // 未実装
};

/** 日付の正規化
 * "1日" = "ついたち"
 * "2日" = "ふつか"
 */
uu.perry.method.japaneseDayNameNormalize = function(day) {
  var me = arguments.callee, rv = [], d = parseInt(day);
  if (d <= 10) { rv.push(me._const[d]); } else
  if (d == 20) { rv.push("はつか"); } else
               { rv.push(uu.perry.method.japaneseSujiYomi(day), "にち"); }
  return rv.join("");
};
uu.perry.method.japaneseDayNameNormalize._const = [
  "zero にち", "ついたち", "ふつか", "みっか", "よっか", "いつか",
  "むいか", "なのか", "ようか", "ここのか", "とうか"
];

/* カレンダーの正規化
 */
uu.perry.method.japaneseCalendarNormalize = function(str) {
  var me = arguments.callee;
  if (str.match(me._const[0])) {
    str = str.replace(me._const[0], function(match, yyyy, mm, dd) {
      var rv = [];
      rv.push(uu.perry.method.japaneseSujiYomi(yyyy), "ねん\r",
              uu.perry.method.japaneseSujiYomi(mm), "がつ\r",
              uu.perry.method.japaneseDayNameNormalize(dd), "\r");
      return rv.join("");
    });
  }
  if (str.match(me._const[1])) {
    str = str.replace(me._const[1], function(match, yyyy) {
      var rv = [];
//    if (parseInt(yyyy) <= 99) { rv.push(" zero "); }
      rv.push(uu.perry.method.japaneseSujiYomi(yyyy), "ねん");
      return rv.join("");
    });
  }
  if (str.match(me._const[2])) {
    str = str.replace(me._const[2], function(match, mm) {
      var rv = [];
      rv.push(uu.perry.method.japaneseSujiYomi(mm), "がつ");
      return rv.join("");
    });
  }
  if (str.match(me._const[3])) {
    str = str.replace(me._const[3], function(match, dd) {
      return uu.perry.method.japaneseDayNameNormalize(dd);
    });
  }
  return str;
};
uu.perry.method.japaneseCalendarNormalize._const = [
  /([0-9]{2,4})(?:\/|-)([0-9]{2})(?:\/|-)([0-9]{2})/gm,   // "2008/01/01" or "2008-01-01"
  /([0-9]{1,4})年/gm,                                     // "08年" ... "2008年"
  /([0-9]{1,2})月/gm,                                     // "01月"
  /([0-9]{1,2})日/gm                                      // "01日"
];


/** "大..."や"中..."などの漢字づかい
 *
 * [\u3041-\u30fe] = ひらがな <br />
 * [\u4e00-\ufa2d] = 漢字
 */
uu.perry.method.japanesePrefix = function(str) {
  var me = arguments.callee, i = 0, sz = me._const.length;
  for (; i < sz; ++i) {
    if (str.match(me._const[i][0])) {
      str = str.replace(me._const[i][0], function(match, s) {
        if (match in me._const) {
          return me._const[match];
        }
        return me._const[i][1] + s;
      });
    }
  }
  return str;
};
uu.perry.method.japanesePrefix._const = [
  [/超([\u4e00-\ufa2d]+)/mg, "ちょう"],
//  [/大([\u4e00-\ufa2d]+)/mg, "だい"],
//  [/中([\u4e00-\ufa2d]+)/mg, "ちゅう"],
//  [/小([\u4e00-\ufa2d]+)/mg, "しょう"],
  [/新([\u4e00-\ufa2d]+)/mg, "しん"],
  [/旧([\u4e00-\ufa2d]+)/mg, "きゅう"],
  [/古([\u4e00-\ufa2d]+)/mg, "こ"]
];

/** "...的"や"...風"などの漢字づかい
 */
uu.perry.method.japaneseSuffix = function(str) {
  var me = arguments.callee, i = 0, sz = me._const.length;
  for (; i < sz; ++i) {
    if (str.match(me._const[i][0])) {
      str = str.replace(me._const[i][0], me._const[i][1]);
    }
  }
  return str;
};
uu.perry.method.japaneseSuffix._const = [
  [/(.+?)的/mg, "[$1]てき"],
  [/(.+?)風/mg, "[$1]ふう"]
];

/*
 * 歴史的仮名遣い 助詞(は→わ,へ→え)
 */
uu.perry.method.japaneseLegacyPostpositionalParticle = function(str) {
  var me = arguments.callee, i = 0, sz = me._const.length;
  for (; i < sz; ++i) {
    if (str.match(me._const[i][0])) {
      str = str.replace(me._const[i][0], me._const[i][1]);
    }
  }
  return str;
};
uu.perry.method.japaneseLegacyPostpositionalParticle._const = [
  [/(ははは)/mg, "ははわ"],
  [/(へへへ)/mg, "$1"],
//[/(.+?)は/mg, "[$1]わ"],
//[/(.+?)へ/mg, "[$1]え"]
  [/([\S]+)は/mg, "[$1]わ"],
  [/([\S]+)へ/mg, "[$1]え"]
];

uu.perry.method._chain = [
//  uu.perry.method.japaneseClipWord, // 連続した漢字と、連続したカタカナを単語として認識させ、前後に "[" と "]" を付加する
//  uu.perry.method.japaneseNumberNormalize, // 漢数字と全角数字の正規化
//  uu.perry.method.japaneseNumberUnitize, // 助数詞を音読みとして展開する
  uu.perry.method.japaneseCalendarNormalize, // カレンダーの正規化
  uu.perry.method.japaneseLegacyPostpositionalParticle, // 歴史的仮名遣い 助詞(は→わ,へ→え)
  uu.perry.method.japanesePrefix, // "大..."や"中..."などの漢字づかい
  uu.perry.method.japaneseSuffix, // "...的"や"...風"などの漢字づかい
  uu.perry.method.japaneseKanji,  // 漢字 → [かんじ] 変換
  uu.perry.method.japaneseOnyomi, // "[" + {連続した漢字} + "]" を検索し、連続した漢字を、辞書を元に音読みのひらがなに変換する
  uu.perry.method.japaneseSujiYomi // 連続した数字を日本語読みに変換
];

/* キーワード
 *
 * - 形態素解析(Morphological Analysis)
 *
 * - 音読み(The Chinese(-derived) reading of a character)
 * -- 漢字が連続した場合は音読み。ただし、湯桶よみ と 重箱よみ は例外処理を行う
 *
 * - 正規表現(JavaScript)
 * -- [\u3041-\u309e] = ひらがな
 * -- [\u30a1-\u30fe] = カタカナ
 * -- [\u4e00-\ufa2d] = 漢字
 *
 * - 連濁(れんだく)
 * -- 日本語において複合語の後部要素の初頭にある清音が、濁音に変化する現象。
 * --- k → g     カブシキ + カイシャ = カブシキガイシャ
 * --- s → z     
 * --- t → d     ニチ + キ = ニッキ
 * --- h → b     ハン + フン = ハンブン, ズ + ほし = ズぼし
 *
 * - 促音(a double [long] consonant)
 * -- [きる][て] → きって
 * -- [かく][かん] → らっかん
 * -- [もく][きん] → もっきん
 * -- [とく][くん] → とっくん
 * -- [とく][けん] → とっけん
 * -- [がく][こう] → がっこう
 * -- [けつ][こん] → けっこん
 * -- [まつたく]   → まったく
 * -- [いつつい]   → いっつい
 * -- [かつ][とう] → かっとう
 * -- [くつ][つく] → くっつく
 * -- [さつち]     → さっち
 * -- [いち][はん] → いっぱん
 * -- [さつ][ち]   → さっち
 * -- ニチ + キ = ニッキ
 * -- サク + カ = サッカ
 * -- ニチ + ホン = ニッポン (これは例外か?)
 * --- 変換ルール   {は行} + 子音が"つ" + {は行} → {は行} + "っ" + {は行} + 半濁音
 * --- ハツ + ヒョウ + シャ = ハッピョウシャ
 *
 * - わかち書き
 * -- 格助詞で分断:   の, に, を, へ, と, から, より, で, が
 * -- 並立助詞で分断: の, に, やら, か, なり, だの,
 * -- 終助詞で分断:   の, か, かしら, とも, な, ぞ, や, わ
 * -- 間投助詞で分断: さ, よ, ね
 * -- 副助詞で分断:   ばかり, まで, だけ, ほど, くらい, など, なり, やら
 * -- 係助詞で分断:   は, も, こそ, でも, しか, さえ, か
 * -- 接続助詞で分断: や
 * -- 句読点で分断:   、。
 */

/* 分解手順
 *
 * + カタカナの連続を単語として認識
 * + 慣用句を単語として認識
 */
uu.perry.dict.voice = {
  "\r\n": ".  ",  "\r":   ".  ",  "\n":   ".  ",  "。":   ".  ",  "、":   "  ",
  "，":   ".  ", // 全角カンマで、ブレスの調整
  "あ":   "ah",   "い":   "iy",   "う":   "ou",   "え":   "ey",   "お":   "o",    // あ い う え お
  "ぁ":   "ah",   "ぃ":   "iy",   "ぅ":   "uu",   "ぇ":   "ey",   "ぉ":   "o",    // ぁ ぃ ぅ ぇ ぉ
                                  "ヴ":   "guu",
  "か":   "kaa",  "き":   "ki",   "く":   "ku",   "け":   "kye",  "こ":   "qo",   // か き く け こ
  "が":   "gaa",  "ぎ":   "gie",  "ぐ":   "guu",  "げ":   "gei",  "ご":   "go",   // が ぎ ぐ げ ご
  "さ":   "saa",  "し":   "shi",  "す":   "su",   "せ":   "sye",  "そ":   "so",   // さ し す せ そ
  "ざ":   "zaa",  "じ":   "ji",   "ず":   "xu",   "ぜ":   "they", "ぞ":   "zo",   // ざ じ ず ぜ ぞ // ず(zu), ぜ(xy)
  "た":   "ta",   "ち":   "qi",   "つ":   "tu",   "て":   "tye",  "と":   "tuo",  // た ち つ て と // "て", "と" が難あり
                                  "っ":   "xe",                                   //       っ
  "だ":   "daa",  "ぢ":   "ji",   "づ":   "xu",   "で":   "de",   "ど":   "bo",   // だ ぢ づ で ど // で(dde), ど(dho)
  "な":   "naa",  "に":   "nni",  "ぬ":   "noo",  "ね":   "nnee", "の":   "no",   // な に ぬ ね の
  "は":   "hha",  "ひ":   "he",   "ふ":   "huu",  "へ":   "hey",  "ほ":   "ho",   // は ひ ふ へ ほ
  "ば":   "baa",  "び":   "vy",   "ぶ":   "buu",  "べ":   "bay",  "ぼ":   "vo",   // ば び ぶ べ ぼ // び(be), ぼ(vo)
  "ぱ":   "paa",  "ぴ":   "py",   "ぷ":   "pu",   "ぺ":   "pe",   "ぽ":   "po",   // ぱ ぴ ぷ ぺ ぽ
  "ま":   "ma",   "み":   "me",   "む":   "muu",  "め":   "mae",  "も":   "mo",   // ま み む め も
  "や":   "ya",                   "ゆ":   "yu",                   "よ":   "yo",   // や    ゆ    よ // ゆ(ew)
  "ゃ":   "ya",                   "ゅ":   "yu",                   "ょ":   "yo",   // ゃ    ゅ    ょ // や(yeah)
  "ら":   "raa",  "り":   "ry",   "る":   "lu",   "れ":   "re",   "ろ":   "ro",   // ら り る れ ろ
  "わ":   "wa",                   "を":   "uo.",                   "ん":   "n",    // わ    を    ん // "ん" がどうにも

  "あん": "um",   "いん": "een",  "うん": "unn",  "えん": "enn",  "おん": "on",
  "ぁん": "ann",  "ぃん": "een",  "ぅん": "unn",  "ぇん": "enn",  "ぉん": "on",
  "かん": "khan", "きん": "qeen", "くん": "quun", "けん": "ken",  "こん": "cone",
  "さん": "sun",  "しん": "shin", "すん": "soon", "せん": "sen",  "そん": "son",
  "ざん": "zan",  "じん": "jin",  "ずん": "zuum", "ぜん": "zen",  "ぞん": "zone",
  "たん": "taan", "ちん": "chin", "つん": "tuun", "てん": "ten",  "とん": "tone",
  "だん": "dan",  "ぢん": "jin",  "づん": "zuum", "でん": "den",  "どん": "done",
  "なん": "nan",  "にん": "nin",  "ぬん": "noon", "ねん": "neyn", "のん": "nown",
  "はん": "hann", "ひん": "hin",  "ふん": "foon", "へん": "hen",  "ほん": "phone",
  "まん": "man",  "みん": "meen", "むん": "moon", "めん": "men",  "もん": "mon",
  "やん": "yan",                  "ゆん": "yun",                  "よん": "yon",
  "らん": "run",  "りん": "reen", "るん": "rune", "れん": "len",  "ろん": "rone",
  "わん": "wan",                  "をん": "on",

  // あ行
  "あっ": "atu",
  "あった": "at-ta",
  "おっ": "oh",
  "あい": "ij",
  "あう": "ow?",
  "あがる": "a girl", // "ahgaaru",
  "あゆ": "auy",
  "あふ": "ov", // "あふ": "af",
  "あむ": "am",
  "あう": "iw",
  "あお": "ao",
  "あわせ": "hour say",
  "いー": "ee",
  "いよ": "iyo",
  "うー": "oo",
  "えっ?": "ey",
  "おー": "oh",

  // か行
  "かい": "caiy", // cai
  "がい": "guy",
  "がー": "gaaa",
  "がーる": "girl",
  "きゃ": "kkya",
  "きょ": "kyo",
  "きょう": "kyo",
  "ぎょう": "giyo",

  "くっ": "qe",
  "くー": "qoo",
  "ごー": "go",
  "けし": "keeshi",
  "けぇん": "kan",
  "こう": "kaw",
  // さ行
  "じぃ": "gee",
  "じぃー": "gee",
  "じぃーっと": "geee tuo",
  "しー": "si",
  "じー": "gee",
  "しっ": "ce",
  "しゃ": "sha",
  "じゃ": "jaa",
  "じょ": "jo",
  "じゅ": "ju",
  "じゅん": "june",
  "すし": "sushi",
  "ずみ": "zumi",
  "せい": "say",
  "そー": "saww",
  "そう": "saww",
  "そっ": "sock",
  // た行
  "だー": "daaa",
  "だっ": "daa",
  "ちゅ": "tiuu",
  "ちゃ": "cha",
  "ちゃい": "chai",
  "ちょ": "cho",
  "ちょう": "chou",
  "つっ": "tu",
  "っと": "tuo",
  "づみ": "zumi",
  "でか": "dedkaa",
  "でこ": "dedcau",
  "でぃー": "di", "でぃ": "dy",
  "てぃ": "te",   "てぃー": "te",
  "てぅ": "tu",   
  "てー": "tee",
  "でばっく": "debug",
  "でばっぐ": "debug",
  "でっぱ": "deppa",
  "とう": "toe",
  "とぅ": "toe",
  "とー": "toe",
  "とぅー": "too",
  "とぅーん": "toon",
  "とし": "tosi",
  "とわ": "touwa",
  // な行
  "なっ": "na",
  "にっぱん": "nippon",
  "のー": "know",
  // は行
  "はぐ": "hug!",
  "はげ": "hha gei",
  "ぱー": "pa",
  "はー": "hi",
  "はな": "hanaa",
  "はね": "hannee",
  "はい": "haai",
  "ばに": "bunny",
  "はっ": "hat",
  "ばって": "baatye",
  "ぱっぴ": "happy",
  "ふお": "fo",   "ふぉ": "fo", "ふう": "fu",   "ふぅ": "fu", "ふあ": "fy",   "ふぁ": "fy",
  "ひー": "hee",
  "びー": "beeee",
  "びび": "bb",   "ばい": "by",
  "ひよ": "he-yo",
  "ひょ": "he-yo",
  "ぴょ": "pyo",
  "ぴゅ": "pu",
  "びゅ": "vu",
  "ふー": "foo",
  "ふあ": "fi", // "ふあ": "ha",
  "ふぁ": "ffa",
  "ふぁん": "fan",
  "ぷらいす": "price",
  "ぶん": "boom",
  "へー": "hey",
  "ほー": "ho",
  "ぼー": "bo",
  "ほほー": "fo phone",
  "ほほーん": "fo phone",
  // ま行
  "めー": "maii",
  "まっく": "mac",
  // や行
  "やっ": "yaa",
  "ょう": "yau",
  "よう": "yoh",
  // ら行
  "らい": "raae",
  "ろー": "raw",
  "りょ": "rio",
  "りよ": "rio",
  "りよう": "rio",
  "りょう": "rio",
  "りー": "leee",
  "れす": "less",
  // わ行

  "": ""
};


/* 連続した漢字用の辞書 */
/*
  "火花":   "[ヒばな]",   // 連濁, 重箱読み
  "田畑":   "[たはた]",   // 
  "時々":   "[ときどき]",
  "彼女":   "[かのジョ]",
  "彼氏":   "[かれシ]",
  "半年":   "[ハンとし]",
  "夏休":   "[なつやすみ]",
  "夏休み": "[なつやすみ]",
  "冬休":   "[ふゆやすみ]",
  "冬休み": "[ふゆやすみ]",
  "毎日":   "[マイにち]",
  "毎月":   "[マイつき]",
  "毎年":   "[マイとし]",
  "毎回":   "[マイかい]",
  "明方":   "[あけがた]",

  "図星":   "[ズぼし]", // 連濁, 重箱読み
 */
uu.perry.dict.onyomi = {
  "王":     "オウ",       "玉":     "ギョク",   "音":     "オン",     "入":     "ニュウ",
  "入出":   "ニュウシュツ",
  "出":     "シュツ",     "花":     "カ",       "貝":     "バイ",     "学":     "ガク",
  "学校":   "ガッコウ",   "校":     "コウ",     "生":     "セイ",     "年":     "ネン",
  "休":     "キュウ",     "空":     "クウ",     "先":     "セン",     "見":     "ケン",
  "男":     "ナン",       "女":     "ニョ",     "男女":   "ダンジョ",
  // body parts
  "目":     "モク",       "鼻":     "ビ",       "口":     "コウ",     "耳":     "ジ",
  "顔":     "ガン",       "首":     "シュ",     "手":     "シュ",     "足":     "ソク",
  "毛":     "モウ",       "羽":     "ウ", 
  // weather
  "晴":     "セイ",       "天":     "テン",     "雨":     "ウ",       "曇":     "ドン",
  "雲":     "ウン",       "雪":     "セツ",     "風":     "フウ",
  // geo
  "山":     "サン",       "川":     "セン",     "谷":     "コク",     "糸":     "シ",
  "車":     "シャ",       "文":     "ブン",     "文字":   "モジ",     "字":     "ジ",
  "人":     "ジン",       "人数":   "ニンズウ", // 連濁
  "正":     "セイ",       "正直":   "ショウジキ",                     "正味":   "ショウミ",
  "草":     "ソウ",       "草木":   "くさキ",   // 湯桶読み
  "竹":     "チク",       "林":     "リン",     "虫":     "チュウ",   "天":     "テン",
  "田":     "デン",       "本":     "ホン",     "本名":   "ホンミョウ",
  "本日":   "ホンジツ",   "名":     "メイ",     "立":     "リツ",     "力":     "リョク",
  // number
  "一":     "イチ",       "二":     "ニ",       "三":     "サン",     "四":     "シ",
  "五":     "ゴ",         "六":     "ロク",     "七":     "シチ",     "八":     "ハチ",
  "九":     "キュウ",     "十":     "ジュウ",   "百":     "ヒャク",   "千":     "セン",
  "万":     "マン",       "億":     "オク",     "兆":     "チョウ",   "京":     "ケイ",
  // 慣用句(idiom)
  "一日一膳": "イチニチイチゼン",

  "区":     "ク",         "画":     "カク",
  // day of the week
  "曜":     "ヨウ",       "曜日":   "ヨウビ",   "日":     "ニチ",     "日曜":   "ニチヨウ",
  "日本":   "ニッポン", // 促音 ニチ + ホン = ニッポン
  "月":     "ゲツ",       "火":     "カ",       "水":     "スイ",     "木":     "モク",
  "金":     "キン",       "土":     "ド",
  "小":     "ショウ",     "中":     "チュウ",   "大":     "ダイ",
  "大人":   "オトナ",     "大人数": "ダイニンズウ", // 連濁 ニン + スウ = ニンズウ
  "上":     "ジョウ",     "下":     "ゲ",
  "左":     "サ",         "右":     "ユウ",
  // 
  "里":     "リ",         "村":     "ソン",     "町":     "チョウ",   "木":     "ボク",
  "林":     "リン",       "森":     "シン",
  // color
  "赤":     "セキ",       "青":     "セイ",     "黄":     "コウ",     "緑":     "リョク",
  "茶":     "チャ",       "白":     "ハク",     "黒":     "コク",

  // time
  "朝":     "チョウ",     "昼":     "チュウ",   "夕":     "セキ",     "夜":     "ヤ",
  "早":     "ソウ",       "遅":     "チ",       "時":     "ジ",       "間":     "カン",
  "未":     "ミ",         "来":     "ライ",     "暦":     "レキ",     "史":     "シ",

  "引":     "イン",       "園":     "エン",     "遠":     "エン",     "近":     "キン",
  "何":     "カ",         "科":     "カ",       "家":     "カ",       "歌":     "カ",
  "絵":     "カイ",       "画":     "ガ",       "回":     "カイ",     "海":     "カイ",
  "野":     "ヤ",
  "外":     "ガイ",
  "角":     "カク",
  "楽":     "ガク",
  "活":     "カツ",
  "丸":     "ガン",
  "岩":     "ガン",
  "石":     "セキ",
  "汽":     "キ",
  "記":     "キ",
  "帰":     "キ",
  "機":     "キ",
  "弓":     "キュウ",
  "京":     "キョウ",
  "強":     "キョウ",
  "教":     "キョウ",
  "弱":     "ジャク",

  // relation
  "親":     "シン",
  "子":     "シ",
  "父":     "フ",
  "母":     "ボ",
  "兄":     "ケイ",
  "兄弟":   "[キョウダイ]",
  "弟":     "テイ",
  "姉":     "シ",
  "姉妹":   "[シマイ]",
  "妹":     "マイ",
  "友":     "ユウ",
  "彼":     "ヒ",

  "計":     "ケイ",
  "元":     "ゲン",
  "言":     "ゲン",
  "原":     "ゲン",
  "形":     "ケイ",
  "戸":     "コ",
  "新":     "シン",
  "古":     "コ",
  "午":     "ゴ",
  "前":     "ゼン",
  "後":     "ゴ",
  "後者":   "[コウシャ]",
  "者":     "シャ",
  "語":     "ゴ",
  "公":     "コウ",
  "約":     "ヤク",
  "広":     "コウ",
  "交":     "コウ",
  "光":     "コウ",
  "考":     "コウ",
  "行":     "コウ",
  "高":     "コウ",
  "高校":   "[コウコウ]",
  "高校生": "[コウコウセイ]",
  "国":     "コク",
  "今":     "コン",
  "算":     "サイ",
  "才":     "サイ",
  "止":     "シ",
  "市":     "シ",
  "矢":     "シ",
  "思":     "シ",
  "紙":     "シ",
  "寺":     "ジ",
  "自":     "ジ",
  "室":     "シツ",
  "週":     "シュウ",
  "春":     "シュン",
  "夏":     "カ",
  "秋":     "シュウ",
  "冬":     "トウ",
  "多":     "タ",
  "少":     "ショウ",
  "場":     "ジョウ",
  "色":     "ショク",
  "食":     "ショク",
  "心":     "シン",
  "身":     "シン",
  "図":     "ズ",
  "工":     "コウ",
  "作":     "サク",
  "作家":   "[サッカ]", // 促音 サク + カ = サッカ
  "不":     "フ",
  "読":     "ドク",
  "書":     "ショ",
  "数":     "スウ",
  "東":     "トウ",
  "西":     "セイ",
  "南":     "ナン",
  "北":     "ボク",
  "声":     "セイ",
  "星":     "セイ",
  "切":     "セツ",
  "船":     "セン",
  "線":     "セン",
  "組":     "ソ",
  "走":     "ソウ",
  "細":     "ソウ",
  "歩":     "ホ",
  "太":     "タイ",
  "体":     "タイ",
  "台":     "ダイ",
  "地":     "チ",
  "池":     "チ",
  "知":     "チ",
  "長":     "チョウ",
  "直":     "チョク",
  "通":     "ツウ",
  "店":     "テン",
  "点":     "テン",
  "電":     "デン",
  "刀":     "トウ",
  "当":     "トウ",
  "答":     "トウ",
  "頭":     "トウ",
  "同":     "ドウ",
  "道":     "ドウ",
  "内":     "ナイ",
  // animal and meat
  "犬":     "ケン",
  "猫":     "ビャク",
  "鳥":     "チョウ",
  "魚":     "ギョ",
  "牛":     "ギュウ",
  "馬":     "バ",
  "馬鹿":   "バカ",
  "鹿":     "ロク",
  "肉":     "ニク",
  // food
  "米":     "マイ",
  "麦":     "バク",
  "寿司":   "スシ",
  "鮨":     "スシ",
  // economic
  "売":     "バイ",
  "買":     "バイ",
  "円":     "エン",
  "会":     "カイ",
  "社":     "シャ",

  "半":     "ハン",
  "半分":   "[ハンブン]", // 連濁  ハン + フン = ハンブン
  "番":     "バン",
  "分":     "ブン",
  "聞":     "ブン",
  "方":     "ホウ",
  "毎":     "マイ",
  "万":     "マン",
  "明":     "メイ",
  "鳴":     "メイ",
  "門":     "モン",
  "用":     "ヨウ",
  "理":     "リ",
  "話":     "ワ",
  "世":     "セ",
  "界":     "カイ",
  "最":     "サイ",
  "動":     "ドウ",
  "驚":     "キョウ",
  "無":     "ム",
  "害":     "ガイ",
  "超":     "チョウ",
  "発表者": "[ハッピョウシャ]", // 促音 ハツ + ヒョウ + シャ = ハッピョウシャ
  "視":     "シ",
  "愚":     "グ",
  "痴":     "チ",
  "日記":   "[ニッキ]", // 促音 ニチ + キ = ニッキ
  "返":     "ヘン",
  "笑":     "ショウ",
  "環":     "カン",
  "境":     "キョウ",
  "整":     "セイ",
  "理":     "リ",
  "進":     "シン",
  "決":     "ケツ",
  "度":     "ド",
  "株":     "カブ",
  "式":     "シキ",
  "有":     "ユウ",
  "限":     "ゲン",
  "個":     "コ",

  // flag
  "韓":     "カン",
  "朝":     "チョン",
  "鮮":     "セン",
  "統":     "トウ",
  "領":     "ニョウ",
  "反":     "ハン",
  "活":     "カツ",
  "逮":     "タイ",
  "捕":     "ホ",
  "投":     "トウ",
  "獄":     "ゴク",
  
  "漢字":   "カンジ",

  "ペリー": "ペリー" // end of array
};

/** 小学校3年生程度の辞書
 */
uu.perry.dict.kanji = {
  "玉":     "[たま]",           "玉入":   "[たまいれ]",
  "音":     "[おと]",
  "入":     "[い]",
  "出":     "[だ]",
  "出さ":   "[ださ]",
  "出し":   "[だし]",
  "出す":   "[だす]",
  "出せ":   "[だせ]",
  "出そ":   "[だそ]",
  "出さ":   "[ださ]",
  "出る":   "[でる]",
  "出れ":   "[でれ]",
  "出ろ":   "[でろ]",
  "花":     "[はな]",           "花火":   "[はなび]",           "火":     "[ひ]",
  "火花":   "[ひばな]",
  "貝":     "[かい]",           "学":     "[まな]",             "学校":   "[がっこう]",
  "学生":   "[がくせい]",       "学年":   "[がくねん]",         "校":     "[こう]",
  "休":     "[やす]",
  "空":     "[そら]",           "先":     "[さき]",             "先生":   "[せんせい]",
  "見":     "[み]",             "男":     "[おとこ]",           "女":     "[おんな]",
  "男女":   "[だんじょ]",

  // body parts
  "目":     "[め]",             "鼻":     "[はな]",             "口":     "[くち]",
  "耳":     "[みみ]",           "顔":     "[かお]",             "首":     "[くび]",
  "手":     "[て]",             "足":     "[あし]",             "毛":     "[け]",
  "羽":     "[はね]", 

  // weather
  "晴れ":   "[はれ]",           "晴天":   "[せいてん]",         "雨":     "[あめ]",
  "曇":     "[くも]",           "雲":     "[くも]",             "雪":     "[ゆき]",
  "風":     "[かぜ]",

  // geo
  "山":     "[やま]",           "川":     "[かわ]",             "谷":     "[たに]",
  "糸":     "[いと]",           "糸車":   "[いとぐるま]",       "車":     "[くるま]",
  "文":     "[ふみ]",           "文字":   "[もじ]",             "文学":   "[ぶんがく]",
  "字":     "[あざ]",           "人":     "[ひと]",
  "正":     "[ただ]",           "生":     "[なま]",             "草":     "[くさ]",
  "竹":     "[たけ]",
  "竹林":   "[たけばやし]",
  "虫":     "[むし]",
  "天":     "[あめ]",
  "田":     "[た]",
  "田畑":   "[たはた]",
  "本":     "[もと]",
  "本名":   "[ほんみょう]",
  "本日":   "[ほんじつ]",
  "本当":   "[ほんとう]",
  "名":     "[な]",
  "立":     "[たつ]",
  "力":     "[ちから]",
  "区画":   "[くかく]",
  // day of the week
  "曜":     "[よう]",
  "曜日":   "[ようび]",
  "日":     "[ひ]",
  "日曜":   "[にちよう]",
  "日本":   "[にっぽん]",
  "月":     "[つき]",
  "月曜":   "[げつよう]",
  "火":     "[ひ]",
  "火曜":   "[かよう]",
  "水":     "[みず]",
  "水曜":   "[すいよう]",
  "木":     "[き]",
  "木曜":   "[もくよう]",
  "金":     "[かね]",
  "金曜":   "[きんよう]",
  "土":     "[つち]",
  "土曜":   "[どよう]",
  "昨日":   "[きのう]",
  "一昨日": "[おととい]",
  "明日":   "[あした]",
  "明後日": "[あさって]",
  "再来年": "[さらいねん]",
  "来年":   "[らいねん]",
  "今年":   "[ことし]",
  "去年":   "[きょねん]",
  "一昨年": "[おととし]",

  "小":     "[ちい]",
  "中":     "[なか]",
  "大":     "[おお]",
  "大地":   "[だいち]",
  "大小":   "[だいしょう]",
  "大人":   "[おとな]",
  "上":     "[うえ]",
  "上下":   "[じょうげ]",
  "下":     "[した]",
  "左":     "[ひだり]",
  "左右":   "[さゆう]",
  "右":     "[みぎ]",
  // 
  "里":     "[さと]",
  "村":     "[むら]",
  "町":     "[まち]",
  "木":     "[き]",
  "林":     "[はやし]",
  "森":     "[もり]",
  "森林":   "[しんりん]",
  // color
  "赤":     "[あか]",
  "青":     "[あお]",
  "黄":     "[き]",
  "緑":     "[みどり]",
//"茶":     "[ちゃ]",
  "白":     "[しろ]",
  "黒":     "[くろ]",

  // time
  "朝":     "[あさ]",
  "昼":     "[ひる]",
  "昼夜":   "[ちゅうや]",
  "夕":     "[ゆう]",
  "夜":     "[よる]",
  "早":     "[はや]",
  "遅":     "[おそ]",
  "時":     "[とき]",
  "時々":   "[ときどき]",
  "時間":   "[じかん]",
  "間":     "[あいだ]",
  "未":     "[いま]",
  "未来":   "[みらい]",
  "来":     "[くる]",
  "暦":     "[こよみ]",
  "歴史":   "[れきし]",

  "引":     "[ひ]",
  "園":     "[その]",
  "遠":     "[とお]",
  "遠近":   "[えんきん]",
  "近":     "[ちか]",
  "何":     "[なに]",
  "科":     "[しな]",
  "家":     "[いえ]",
  "歌":     "[うた]",
  "絵":     "[え]",
  "絵画":   "[かいが]",
  "画":     "[えが]",
  "回":     "[まわ]",
  "海":     "[うみ]",
  "野":     "[の]",
  "野外":   "[やがい]",
  "野郎":   "[やろう]",
  "外":     "[そと]",
  "角":     "[つの]",
  "楽":     "[らく]",
  "活":     "[い]",
  "丸":     "[まる]",
  "岩":     "[いわ]",
  "岩石":   "[がんせき]",
  "石":     "[いし]",
  "汽":     "[き]",
  "汽車":   "[きしゃ]",
  "記":     "[しる]",
  "記者":   "[きしゃ]",
  "帰":     "[かえ]",
  "弓":     "[ゆみ]",
  "京":     "[みやこ]",
  "強":     "[つよい]",
  "強弱":   "[きょうじゃく]",
  "弱":     "[よわ]",
  "教":     "[おし]",
  // relation
  "親":     "[おや]",
  "子":     "[こ]",
  "父":     "[ちち]",
  "父兄":   "[ふけい]",
  "母":     "[はは]",
  "兄":     "[あに]",
  "兄弟":   "[きょうだい]",
  "弟":     "[おとうと]",
  "姉":     "[あね]",
  "姉妹":   "[きょうだい]",
  "妹":     "[いもうと]",
  "友":     "[とも]",
  "彼":     "[かれ]",
  "彼女":   "[かのじょ]",
  "彼氏":   "[かれし]",

  "計":     "[はか]",
  "元":     "[もと]",
  "言":     "[い]",
  "原":     "[はら]",
  "原形":   "[げんけい]",
  "形":     "[かたち]",
  "戸":     "[と]",
  "新":     "[あたら]",
  "新し":   "[あたらし]",
  "新年":   "[しんねん]",
  "新春":   "[しんしゅん]",
  "古":     "[ふる]",
  "午":     "[うま]",
  "午後":   "[ごご]",
  "前":     "[まえ]",
  "前後":   "[ぜんご]",
  "後":     "[のち]",
  "後者":   "[こうしゃ]",
  "語":     "[かた]",
  "公":     "[おおやけ]",
  "公約":   "[こうやく]",
  "広":     "[ひろ]",
  "交":     "[まじ]",
  "光":     "[ひか]",
  "考":     "[かんが]",
  "行":     "[おこな]",
  "高":     "[たか]",
  "高校":   "[こうこう]",
  "高校生": "[こうこうせい]",
  "合わせ": "[あわせ]",
  "国":     "[くに]",
  "国語":   "[こくご]",
  "今":     "[いま]",
  "今後":   "[こんご]",
  "算":     "[かぞ]",
  "才":     "[ざえ]",
  "止":     "[と]",
  "市":     "[いち]",
  "矢":     "[や]",
  "思":     "[おも]",
  "思考":   "[しこう]",
  "紙":     "[かみ]",
  "寺":     "[てら]",
  "自":     "[みずか]",
  "自室":   "[じしつ]",
  "室":     "[むろ]",
  "週":     "[めぐ]",
  "週末":   "[しゅうまつ]",
  "年":     "[とし]",
  "春":     "[はる]",
  "秋":     "[あき]",
  "夏":     "[なつ]",
  "夏休":   "[なつやすみ]",
  "冬":     "[ふゆ]",
  "多":     "[おお]",
  "多少":   "[たしょう]",
  "少":     "[すく]",
  "場":     "[ば]",
  "色":     "[いろ]",
  "食":     "[たべ]",
  "心":     "[こころ]",
  "心身":   "[しんしん]",
  "心機":   "[しんき]",
  "図":     "[はか]",
  "図星":   "[ずぼし]",
  "図工":   "[ずこう]",
  "工":     "[たくみ]",
  "工作":   "[こうさく]",
  "作":     "[つく]",
  "作家":   "[さっか]",
  "読":     "[よむ]",
  "読み":   "[よみ]",
  "読む":   "[よむ]",
  "読ん":   "[よん]",
  "読書":   "[どくしょ]",
  "書":     "[か]",
  "数":     "[かぞ]",
  "数字":   "[すうじ]",
  "東":     "[ひがし]",
  "西":     "[にし]",
  "南":     "[みなみ]",
  "北":     "[きた]",
  "声":     "[こえ]",
  "星":     "[ほし]",
  "切":     "[き]",
  "船":     "[ふね]",
  "線":     "[すじ]",
  "組":     "[くみ]",
  "歩":     "[ある]",
  "走":     "[はし]",
  "太":     "[ふと]",
  "細":     "[ほそ]",
  "体":     "[からだ]",
  "台":     "[たい]",
  "地":     "[つち]",
  "池":     "[いけ]",
  "知":     "[し]",
  "長":     "[なが]",
  "直":     "[ただ]",
  "通":     "[とお]",
  "店":     "[みせ]",
  "点い":   "[つい]",
  "点く":   "[つく]",
  "点す":   "[ともす]",
  "点し":   "[ともし]",
  "点":     "[てん]",
  "電":     "[いなずま]",
  "刀":     "[かたな]",
  "当":     "[あ]",
  "答":     "[こた]",
  "頭":     "[あたま]",
  "同":     "[おな]",
  "道":     "[みち]",
  "内":     "[うち]",
  // animal and meat
  "犬":     "[いぬ]",
  "猫":     "[ねこ]",
  "鳥":     "[とり]",
  "魚":     "[さかな]",
  "魚肉":   "[ぎょにく]",
  "牛":     "[うし]",
  "馬":     "[うま]",
  "馬鹿":   "[ばか]",
  "鹿":     "[しか]",
  "肉":     "[しし]",
  // food
  "米":     "[こめ]",
  "麦":     "[むぎ]",
  // economic
  "売":     "[う]",
  "売買":   "[ばいばい]",
  "買":     "[か]",
//"円":     "[まる]",
  "円":     "[エン]",
  "会":     "[あう]",
  "会社":   "[かいしゃ]",
  "社":     "[やしろ]",
  "社会":   "[しゃかい]",

  "半":     "[なか]",
  "半分":   "[はんぶん]",
  "番":     "[つが]",
  "番長":   "[ばんちょう]",
  "分":     "[わ]",
  "聞":     "[き]",
  "方":     "[かた]",
  "毎":     "[ごと]",
  "毎日":   "[まいにち]",
  "毎月":   "[まいつき]",
  "毎年":   "[まいとし]",
  "毎回":   "[まいかい]",
  "万":     "[よろず]",
  "明":     "[あ]",
  "明方":   "[あけがた]",
  "鳴":     "[な]",
  "門":     "[かど]",
  "用":     "[よう]",
  "用い":   "[もちい]",
  "理":     "[ことわり]",
  "話":     "[はなし]",
  "世界":   "[せかい]",
  "最大":   "[さいだい]",
  "動作":   "[どうさ]",
  "驚":     "[おどろ]",
  "無害":   "[むがい]",
  "込":     "[こ]",
  "超":     "[ちょう]",
  "超え":   "[こえ]",
  "発表者": "[ぱっぴょうしゃ]",
  "視点":   "[してん]",
  "愚痴":   "[ぐち]",
  "日記":   "[にっき]",
  "返す":   "[かえす]",
  "笑":     "[わら]",
  "環境":   "[かんきょう]",
  "整":     "[ととの]",
  "整理":   "[せいり]",
  "前進":   "[ぜんしん]",
  "決":     "[き]",
  "本年":   "[ほんねん]",
  "本年度": "[ほんねんど]",
  "付き合い":"[つきあい]",
  "株式":   "[かぶしき]",
  "有限":   "[ゆうげん]",
  "個人":   "[こじん]",
  "選択":   "[せんたく]",
  "開国":   "[かいこく]",
  "誠意":   "[せいい]",
  "武器":   "[ぶき]",
  "近場":   "[ちかば]",

  "韓国":   "[かんこく]",
  "朝鮮":   "[ちょうせん]",
  "大統領": "[だいとうりょう]",
  "反日":   "[はんにち]",
  "活動":   "[かつどう]",
  "逮捕":   "[たいほ]",
  "半年":   "[はんとし]",
  "投獄":   "[とうごく]",
  "済み":   "[ずみ]",
  "済む":   "[ずむ]",


  "近所":   "[きんじょ]",
  "吉野家": "[よしのや]",
  "垂れ":   "[たれ]",
  "幕":     "[まく]",
  "座れ":   "[すわれ]",
  "引":     "[ひ]",
  "行く":   "[いく]",
  "行っ":   "[いっ]",
  "呼":     "[よ]",
  "ペット": "pet",
  "ショップ": "shop",
  "連れ":   "[つれ]",
  "食べる": "[たべる]",
  "飛":     "[と]",
  "上がる": "[あがる]",
  "下がる": "[さがる]",
  "入荷":   "[にゅうか]",
  "真上":   "[まうえ]",
  "持":     "[も]",
  "互換性": "[ごかんせい]",
  "悩":     "[なや]",
  "癒":     "[いや]",
  "頃":     "[ころ]",
  "仙台":   "[せんだい]",
  "一ヶ月": "[いっかげつ]",
  "家庭":   "[かてい]",
  "菜園":   "[さいえん]",
  "苗":     "[なえ]",
  "以来":   "[いらい]",
  "実装":   "[じっそう]",
  "進む":   "[すすむ]",
  "進め":   "[すすめ]",
  "進ま":   "[すすま]",
  "気晴らし": "[きばらし]",
  "世界":   "[せかい]",
  "世界初": "[せかいはつ]",
  "及ぶ":   "[およぶ]",
  "及び":   "[および]",
  "火消し": "[ひけし]",
  "始め":   "[はじめ]",
  "買物":   "[かいもの]",
  "買い物": "[かいもの]",
  "来る":   "[くる]",
  "来た":   "[きた]",
  "外国人": "[がいこくじん]",
  "標準":   "[ひょうじゅん]",
  "搭載":   "[とうさい]",
  "酷使":   "[こくし]",
  "以上":   "[いじょう]",
  "以下":   "[いか]",
  "以外":   "[いがい]",
  "以内":   "[いない]",
  "無い":   "[ない]",
  "無さ":   "[なさ]",
  "無し":   "[なし]",
  "試さ":   "[ためさ]",
  "試し":   "[ためし]",
  "試す":   "[ためす]",
  "試せ":   "[ためせ]",
  "試そ":   "[ためそ]", // サ行なんちゃら活用だっけ? 
  "参考":   "[さんこう]",
  "場合":   "[ばあい]",
  "構築":   "[こうちく]",
  "病":     "[びょう]",
  "予想":   "[よそう]",
  "効果":   "[こうか]",
  "気":     "[き]",
  "餌":     "[えさ]",
  "進呈":   "[しんてい]",
  "食べ物": "[たべもの]",
  "食物":   "[しょくもつ]",
  "斜め":   "[ななめ]",
  "作業":   "[さぎょう]",
  "強力":   "[きょうりょく]",
  "楽勝":   "[らくしょう]",
  "即":     "[そく]",
  "思考":   "[しこう]",
  "停止":   "[ていし]",
  "速攻":   "[そっこう]",
  "攻":     "[こう]",
  "予想外": "[よそうがい]",
  "仕草":   "[しぐさ]",
  "可愛":   "[かわい]",
  "出会":   "[であう]",
  "出会っ": "[であっ]",
  
  "ペリー": "perry"
};

})(); // end (function())()