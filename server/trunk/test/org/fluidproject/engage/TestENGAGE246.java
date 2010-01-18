/*
 * Created on 12 Jun 2009
 */
package org.fluidproject.engage;

import java.io.FileInputStream;

import uk.org.ponder.json.support.JSONProvider;
import uk.org.ponder.saxalizer.SAXalizerMappingContext;

import junit.framework.TestCase;

public class TestENGAGE246 extends TestCase {
    public static final String[] files = { "ENGAGE-246-test.xml", };

    public static final String dir = "bin/testdata/artifacts/";

    public static final int reps = 1000;

    public void testEngage246() throws Exception {
        String filename = dir + files[0];
        FileInputStream fis = new FileInputStream(filename);
        XPPJSONGenerator gen = new XPPJSONGenerator();
        gen.parseStream(fis);
        fis.close();
        Object thing = gen.root.get("exhibit");
        assertNotNull("Required exhibit", thing);
        JSONProvider provider = new JSONProvider();
        provider.setMappingContext(new SAXalizerMappingContext());
        String JSON = provider.toString(gen.root);
        assertEquals("Comment elided", -1, JSON.indexOf("XStandard"));
    }
}
