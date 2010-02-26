/*
 * Created on 25 Feb 2010
 */
package org.mozilla.javascript.tests;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.ContextFactory;
import org.mozilla.javascript.Scriptable;

import junit.framework.TestCase;

public class TestRegExp extends TestCase {
  String head = "    <head>|" +
"        <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />|"+
"        <meta name=\"viewport\" content=\"width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;\" />|"+
"        <meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />|"+
"        <title>Home</title>|"+
"|"+
"        <link rel=\"apple-touch-icon\" href=\"../../../../fluid-engage-core/components/home/images/apple-touch-icon.png\"/>|"+
"|"+
"        <link type=\"text/css\" rel=\"stylesheet\" href=\"../../../../fluid-infusion/src/webapp/framework/fss/css/fss-layout.css\" />|"+
"        <link type=\"text/css\" rel=\"stylesheet\" href=\"../../../../fluid-infusion/src/webapp/framework/fss/css/fss-mobile-layout.css\" />|"+
"        <link type=\"text/css\" rel=\"stylesheet\" href=\"../../../../fluid-infusion/src/webapp/framework/fss/css/fss-mobile-theme-iphone.css\" />|"+
"        <link type=\"text/css\" rel=\"stylesheet\" href=\"../../../../fluid-engage-core/shared/css/engage-mobile.css\" />|"+ 
"        <link type=\"text/css\" rel=\"stylesheet\" href=\"../../../../fluid-engage-core/components/home/css/Home.css\" />|"+
"       |"+ 
"        <script type=\"text/javascript\" src=\"../../../../fluid-infusion/src/webapp/lib/jquery/core/js/jquery.js\"></script>|"+
"        <script type=\"text/javascript\" src=\"../../../../fluid-infusion/src/webapp/lib/json/js/json2.js\"></script>|"+
"        <script type=\"text/javascript\" src=\"../../../../fluid-infusion/src/webapp/framework/core/js/Fluid.js\"></script>|"+
"        <script type=\"text/javascript\" src=\"../../../../fluid-engage-core/lib/jquery/plugins/cookie/js/jquery.cookie.js\"></script>|"+
"        |"+
"        <script type=\"text/javascript\" src=\"../../../../fluid-engage-core/framework/js/user.js\"></script>|"+
"        <script type=\"text/javascript\" src=\"../../../../fluid-engage-core/framework/js/iPhoneChromeless.js\"></script>|"+
"        |"+
"        <script type=\"text/javascript\" src=\"../../../../fluid-engage-core/components/home/js/Home.js\"></script>|"+
"    </head>|";
  public void testRegExp() {
    final int value = 12;
    String source = "var head = \"" +head+ "\".replace(/|/g, \"n\");        head.match(/<link(.|\\s)*?\\/>/gi);";

    Context cx = ContextFactory.getGlobal().enterContext();
    try {
      Scriptable scope = cx.initStandardObjects();
      Object result = cx.evaluateString(scope, source, "source", 1, null);
      assertEquals(new Integer(value), result);
    }
    finally {
      Context.exit();
    }
  }
}
