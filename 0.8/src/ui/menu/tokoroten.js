
var key = arg.list.key,
    keyz = key.length,
    width = arg.image.width,
    border = 2,
    padding = arg.image.padding,
    lastNode = 0,
    userHover = 0,
    autoHover = 0;

arg.image.frameWidth = (padding + border) * keyz + width - padding * 0.5 - border;
arg.image.innerWidth =  padding           * keyz + width * 2;
arg.image.border = border;
arg.image.last = key[keyz - 1];

function hoverEvent(evt, hover, node) {
        if (evt) {
            if (autoHover) { // auto hover -> close
                hoverEvent(0, autoHover = 0, lastNode);
            }
            userHover = hover;
        }
        uu.klass.toggle(node, "active");
        uu.fx(node, 350, { stop: 1, w: hover ? [width, "OutQuad"] : padding });

        lastNode = node;
}

uu.ready(arg.id, function() {
    uu("#" + arg.id + ">ul>li>a").hover(hoverEvent).click(function(evt) {
        arg.click && arg.click(evt, evt.node, uu.attr(evt.node, "data-uueachindex"));
    });
});

arg.auto && setInterval(function() {
    if (!userHover) {
        var ary;

        if (!lastNode) {
            ary = uu.query("#" + arg.id + ">ul>li>a"); // <a>
            lastNode = ary[ary.length - 1];
        }
        ary = uu.node.array(lastNode.parentNode); // <li>
        hoverEvent(0, autoHover = 0, lastNode);
        hoverEvent(0, autoHover = 1, (ary.next && ary.next.firstChild) || ary.first.firstChild);
    }
}, arg.auto);

return <>
<style>
    #{{arg.id}} {
        position: relative;
        width: {{arg.image.frameWidth}}px;
        height: {{arg.image.height}}px;
        overflow: hidden;
        margin: 0 0 0 0;
    }
    #{{arg.id}} ul {
        list-style: none;
        margin: 0;
        display: block;
        width: {{arg.image.innerWidth}}px;
        height: {{arg.image.height}}px;
    }
    #{{arg.id}} ul li {
        float: left;
    }
    #{{arg.id}} ul li a {
        text-indent: -1000px;
        background: #fff repeat;
        border-right: {{arg.image.border}}px solid #fff;
        cursor: pointer;
        display: block;
        overflow: hidden;
        width: {{arg.image.padding}}px;
        height: {{arg.image.height}}px;
    }
    #{{arg.id}} ul li.{{arg.image.last}} a {
        min-width: {{arg.image.width}}px;
    }
    #{{arg.id}} .clear {
        clear: both;
    }
<each arg.list>
    #{{arg.id}} ul li.{{key}} a {
        background: url({{src}});
    }
</each>
</style>
<div id="{{arg.id}}">
  <ul>
    <each arg.list>
        <li class="{{key}}"><a
            href="{{href}}" data-uueachindex="{{n}}">{{link}}</a>
        </li>
    </each>
  </ul>
  <br class="clear" />
</div>
</>
