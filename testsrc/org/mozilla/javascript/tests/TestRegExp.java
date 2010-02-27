/*
 * Created on 25 Feb 2010
 */
package org.mozilla.javascript.tests;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.ContextFactory;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.Scriptable;

import junit.framework.TestCase;

public class TestRegExp extends TestCase {
  String head = "    <head>\\n"
+"        <meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=utf-8\\\" />\\n"
+"        <meta name=\\\"viewport\\\" content=\\\"width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;\\\" />\\n"+
"        <meta name=\\\"apple-mobile-web-app-capable\\\" content=\\\"yes\\\" />\\n"
+"        <title>Home</title>\\n"+
"\\n"+
"        <link rel=\\\"apple-touch-icon\\\" href=\\\"../../../../fluid-engage-core/components/home/images/apple-touch-icon.png\\\"/>\\n"+
"\\n"+
"        <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../../../../fluid-infusion/src/webapp/framework/fss/css/fss-layout.css\\\" />\\n"+
"        <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../../../../fluid-infusion/src/webapp/framework/fss/css/fss-mobile-layout.css\\\" />\\n"+
"        <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../../../../fluid-infusion/src/webapp/framework/fss/css/fss-mobile-theme-iphone.css\\\" />\\n"+
"        <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../../../../fluid-engage-core/shared/css/engage-mobile.css\\\" />\\n"
+"        <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../../../../fluid-engage-core/components/home/css/Home.css\\\" />\\n"+
"       \\n"+ 
"        <script type=\\\"text/javascript\\\" src=\\\"../../../../fluid-infusion/src/webapp/lib/jquery/core/js/jquery.js\\\"></script>\\n"+
"        <script type=\\\"text/javascript\\\" src=\\\"../../../../fluid-infusion/src/webapp/lib/json/js/json2.js\\\"></script>\\n"+
"        <script type=\\\"text/javascript\\\" src=\\\"../../../../fluid-infusion/src/webapp/framework/core/js/Fluid.js\\\"></script>\\n"+
"        <script type=\\\"text/javascript\\\" src=\\\"../../../../fluid-engage-core/lib/jquery/plugins/cookie/js/jquery.cookie.js\\\"></script>\\n"+
"        \\n"+
"        <script type=\\\"text/javascript\\\" src=\\\"../../../../fluid-engage-core/framework/js/user.js\\\"></script>\\n"+
"        <script type=\\\"text/javascript\\\" src=\\\"../../../../fluid-engage-core/framework/js/iPhoneChromeless.js\\\"></script>\\n"+
"        \\n"+
"        <script type=\\\"text/javascript\\\" src=\\\"../../../../fluid-engage-core/components/home/js/Home.js\\\"></script>\\n"+
"    </head>\\n";
  
String head2= "   <head>         <meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=utf-8\\\"></meta>         <meta name=\\\"viewport\\\" content=\\\"width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;\\\"></meta>         <meta name=\\\"apple-mobile-web-app-capable\\\" content=\\\"yes\\\"></meta>         <title>Home</title>          <link rel=\\\"apple-touch-icon\\\" href=\\\"../fluid-engage-core/components/home/images/apple-touch-icon.png\\\"></link>          <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../fluid-infusion/framework/fss/css/fss-layout.css\\\"></link>         <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../fluid-infusion/framework/fss/css/fss-mobile-layout.css\\\"></link>         <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../fluid-infusion/framework/fss/css/fss-mobile-theme-iphone.css\\\"></link>         <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../fluid-engage-core/shared/css/engage-mobile.css\\\"></link>          <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../fluid-engage-core/components/home/css/Home.css\\\"></link>                  <script type=\\\"text/javascript\\\" src=\\\"../fluid-infusion/lib/jquery/core/js/jquery.js\\\"></script>         <script type=\\\"text/javascript\\\" src=\\\"../fluid-infusion/lib/json/js/json2.js\\\"></script>         <script type=\\\"text/javascript\\\" src=\\\"../fluid-infusion/framework/core/js/Fluid.js\\\"></script>         <script type=\\\"text/javascript\\\" src=\\\"../fluid-engage-core/lib/jquery/plugins/cookie/js/jquery.cookie.js\\\"></script>                  <script type=\\\"text/javascript\\\" src=\\\"../fluid-engage-core/framework/js/user.js\\\"></script>         <script type=\\\"text/javascript\\\" src=\\\"../fluid-engage-core/framework/js/iPhoneChromeless.js\\\"></script>                  <script type=\\\"text/javascript\\\" src=\\\"../fluid-engage-core/components/home/js/Home.js\\\"></script>     </head>";
  // <head>\n        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"></meta>\n        <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"></meta>\n        <meta name="apple-mobile-web-app-capable" content="yes"></meta>\n        <title>Home</title>\n\n        <link rel="apple-touch-icon" href="../fluid-engage-core/components/home/images/apple-touch-icon.png"></link>\n\n        <link type="text/css" rel="stylesheet" href="../fluid-infusion/framework/fss/css/fss-layout.css"></link>\n        <link type="text/css" rel="stylesheet" href="../fluid-infusion/framework/fss/css/fss-mobile-layout.css"></link>\n        <link type="text/css" rel="stylesheet" href="../fluid-infusion/framework/fss/css/fss-mobile-theme-iphone.css"></link>\n        <link type="text/css" rel="stylesheet" href="../fluid-engage-core/shared/css/engage-mobile.css"></link> \n        <link type="text/css" rel="stylesheet" href="../fluid-engage-core/components/home/css/Home.css"></link>\n        \n        <script type="text/javascript" src="../fluid-infusion/lib/jquery/core/js/jquery.js"></script>\n        <script type="text/javascript" src="../fluid-infusion/lib/json/js/json2.js"></script>\n        <script type="text/javascript" src="../fluid-infusion/framework/core/js/Fluid.js"></script>\n        <script type="text/javascript" src="../fluid-engage-core/lib/jquery/plugins/cookie/js/jquery.cookie.js"></script>\n        \n        <script type="text/javascript" src="../fluid-engage-core/framework/js/user.js"></script>\n        <script type="text/javascript" src="../fluid-engage-core/framework/js/iPhoneChromeless.js"></script>\n        \n        <script type="text/javascript" src="../fluid-engage-core/components/home/js/Home.js"></script>\n    </head>
  public void testRegExp() {
    String source = "var head = \"" +head2+"\"; head.match(/<link(.|\\s)*?\\/>/gi);";

    Context cx = ContextFactory.getGlobal().enterContext();
    try {
      Scriptable scope = cx.initStandardObjects();
      Object result = cx.evaluateString(scope, source, "source", 1, null);
      NativeArray array = (NativeArray) result;
      assertEquals(6, array.getLength());
    }
    finally {
      Context.exit();
    }
  }
}
