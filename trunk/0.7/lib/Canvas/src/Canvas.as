package {
  import flash.display.Sprite;
  import flash.events.*;
  import flash.external.ExternalInterface;
  import flash.text.TextField;
  import flash.utils.Timer;
  import flash.text.TextFieldType;
  import flash.text.TextFieldAutoSize;

  public class Canvas extends Sprite {
    private var input:TextField;
    private var output:TextField;
    private var sendBtn:Sprite;

    private function jssend(msg:String):void {
//ExternalInterface.call("uu.as.alert", msg);

      output.appendText("JavaScript says: " + msg + "\n");
    }
    public function Canvas() {
      ExternalInterface.addCallback("jssend", jssend);

      input = new TextField();
      input.type = TextFieldType.INPUT;
      input.background = true;
      input.border = true;
      input.width = 350;
      input.height = 18;
      addChild(input);

      sendBtn = new Sprite();
      sendBtn.mouseEnabled = true;
      sendBtn.x = input.width + 10;
      sendBtn.graphics.beginFill(0xCCCCCC);
      sendBtn.graphics.drawRoundRect(0, 0, 80, 18, 10, 10);
      sendBtn.graphics.endFill();
//      sendBtn.addEventListener(MouseEvent.CLICK, clickHandler);
      addChild(sendBtn);

      output = new TextField();
      output.y = 25;
      output.width = 450;
      output.height = 325;
      output.multiline = true;
      output.wordWrap = true;
      output.border = true;
      output.text = "Initializing...\n";
      addChild(output);

      ExternalInterface.call("uu.as.dmz." + ExternalInterface.objectID);
    }
  }
}
