/*
 * Created on 17 Jan 2010
 */
package org.fluidproject.engage;

import java.util.List;

public class TagPatterns {
    public static final TagPatternEntry[] compilePatterns(List patterns) {
        TagPatternEntry[] togo = new TagPatternEntry[patterns.size()];
        for (int i = 0; i < patterns.size(); ++ i) {
            togo[i] = new TagPatternEntry();
            String pattern = (String) patterns.get(i);
            togo[i].segs = pattern.split(".");
        }
        return togo;
    }
}
