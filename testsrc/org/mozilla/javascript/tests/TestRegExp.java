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
  
  String head2= "   <head>   <link rel=\\\"apple-touch-icon\\\" href=\\\"../fluid-engage-core/components/home/images/apple-touch-icon.png\\\"></link>          <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../fluid-infusion/framework/fss/css/fss-layout.css\\\"></link>       <link type=\\\"text/css\\\" rel=\\\"stylesheet\\\" href=\\\"../fluid-infusion/framework/fss/css/fss-mobile-layout.css\\\"></link>       </head>";
  public void testRegExp() {
    String source = "var head = \"" +head2+"\"; head.match(/<link(.|\\s)*?\\/>/gi);";

    Context cx = ContextFactory.getGlobal().enterContext();
    try {
      Scriptable scope = cx.initStandardObjects();
      Object result = cx.evaluateString(scope, source, "source", 1, null);
      NativeArray array = (NativeArray) result;
      assertEquals(3, array.getLength());
    }
    finally {
      Context.exit();
    }
  }
}
