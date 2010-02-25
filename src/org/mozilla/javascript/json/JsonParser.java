/* -*- Mode: java; tab-width: 4; indent-tabs-mode: 1; c-basic-offset: 4 -*-
 *
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Rhino code, released
 * May 6, 1999.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1997-1999
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Norris Boyd
 *   Raphael Speyer
 *   Hannes Wallnoefer
 *
 * Alternatively, the contents of this file may be used under the terms of
 * the GNU General Public License Version 2 or later (the "GPL"), in which
 * case the provisions of the GPL are applicable instead of those above. If
 * you wish to allow use of your version of this file only under the terms of
 * the GPL and not to allow others to use your version of this file under the
 * MPL, indicate your decision by deleting the provisions above and replacing
 * them with the notice and other provisions required by the GPL. If you do
 * not delete the provisions above, a recipient may use your version of this
 * file under either the MPL or the GPL.
 *
 * ***** END LICENSE BLOCK ***** */

package org.mozilla.javascript.json;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptRuntime;

import java.util.ArrayList;
import java.util.List;

/**
 * This class converts a stream of JSON tokens into a JSON value.
 *
 * See ECMA 15.12.
 * @author Raphael Speyer
 * @author Hannes Wallnoefer
 */
public class JsonParser {

    private Context cx;
    private Scriptable scope;

    private int pos;
    private int length;
    private String src;

    public JsonParser(Context cx, Scriptable scope) {
        this.cx = cx;
        this.scope = scope;
    }

    public synchronized Object parseValue(String json) throws ParseException {
        if (json == null) {
            throwParseException("Input string may not be null");
        }
        pos = 0;
        length = json.length();
        src = json;
        Object value = readValue();
        consumeWhitespace();
        if (pos < length) {
            throwParseException("Expected end of stream at char " + pos);
        }
        return value;
    }

    private Object readValue() throws ParseException {
        consumeWhitespace();
        while (pos < length) {
            char c = src.charAt(pos++);
            switch (c) {
                case '{':
                    return readObject();
                case '[':
                    return readArray();
                case 't':
                    return readTrue();
                case 'f':
                    return readFalse();
                case '"':
                    return readString();
                case 'n':
                    return readNull();
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                case '0':
                case '-':
                    return readNumber(c);
                default:
                    throwParseException("Unexpected token: " + c);
            }
        }
        throwParseException("Empty JSON string");
        return null; // unreachable
    }

    private Object readObject() throws ParseException {
        Scriptable object = cx.newObject(scope);
        String id;
        Object value;
        boolean needsComma = false;
        consumeWhitespace();
        while (pos < length) {
            char c = src.charAt(pos++);
            switch(c) {
                case '}':
                    return object;
                case ',':
                    if (!needsComma) {
                        throwParseException("Unexpected comma in object literal");
                    }
                    needsComma = false;
                    break;
                case '"':
                    if (needsComma) {
                        throwParseException("Missing comma in object literal");
                    }
                    id = readString();
                    consume(':');
                    value = readValue();

                    double d = ScriptRuntime.toNumber(id);
                    int index = (int) d;
                    if (d != index) {
                      object.put(id, object, value);
                    } else {
                      object.put(index, object, value);
                    }

                    needsComma = true;
                    break;
                default:
                    throwParseException("Unexpected token in object literal");
            }
            consumeWhitespace();
        }
        throwParseException("Unterminated object literal");
        return null; // unreachable
    }

    private Object readArray() throws ParseException {
        List<Object> list = new ArrayList<Object>();
        boolean needsComma = false;
        consumeWhitespace();
        while (pos < length) {
            char c = src.charAt(pos);
            switch(c) {
                case ']':
                    pos += 1;
                    return cx.newArray(scope, list.toArray());
                case ',':
                    if (!needsComma) {
                        throwParseException("Unexpected comma in array literal");
                    }
                    needsComma = false;
                    pos += 1;
                    break;
                default:
                    if (needsComma) {
                        throwParseException("Missing comma in array literal");
                    }
                    list.add(readValue());
                    needsComma = true;
            }
            consumeWhitespace();
        }
        throwParseException("Unterminated array literal");
        return null; // unreachable
    }

    private String readString() throws ParseException {
        StringBuilder b = new StringBuilder();
        while (pos < length) {
            char c = src.charAt(pos++);
            if (c <= '\u001F') {
                throwParseException("String contains control character");
            }
            switch(c) {
                case '\\':
                    if (pos >= length) {
                        throwParseException("Unterminated string");
                    }
                    c = src.charAt(pos++);
                    switch (c) {
                        case '"':
                            b.append('"');
                            break;
                        case '\\':
                            b.append('\\');
                            break;
                        case '/':
                            b.append('/');
                            break;
                        case 'b':
                            b.append('\b');
                            break;
                        case 'f':
                            b.append('\f');
                            break;
                        case 'n':
                            b.append('\n');
                            break;
                        case 'r':
                            b.append('\r');
                            break;
                        case 't':
                            b.append('\t');
                            break;
                        case 'u':
                            if (length - pos < 5) {
                                throwParseException("Invalid character code: \\u" + src.substring(pos));
                            }
                            try {
                                b.append((char) Integer.parseInt(src.substring(pos, pos + 4), 16));
                                pos += 4;
                            } catch (NumberFormatException nfx) {
                                throwParseException("Invalid character code: " + src.substring(pos, pos + 4));
                            }
                            break;
                        default:
                            throwParseException("Unexcpected character in string: '\\" + c + "'");
                    }
                    break;
                case '"':
                    return b.toString();
                default:
                    b.append(c);
                    break;
            }
        }
        throwParseException("Unterminated string literal");
        return null; // unreachable
    }

    private Number readNumber(char first) throws ParseException {
        StringBuilder b = new StringBuilder();
        b.append(first);
        while (pos < length) {
            char c = src.charAt(pos);
            if (!Character.isDigit(c)
                    && c != '-'
                    && c != '+'
                    && c != '.'
                    && c != 'e'
                    && c != 'E') {
                break;
            }
            pos += 1;
            b.append(c);
        }
        String num = b.toString();
        int numLength = num.length();
        try {
            // check for leading zeroes
            for (int i = 0; i < numLength; i++) {
                char c = num.charAt(i);
                if (Character.isDigit(c)) {
                    if (c == '0'
                            && numLength > i + 1
                            && Character.isDigit(num.charAt(i + 1))) {
                        throwParseException("Unsupported number format: " + num);
                    }
                    break;
                }
            }
            final double dval = Double.parseDouble(num);
            final int ival = (int)dval;
            if (ival == dval) {
                return Integer.valueOf(ival);
            } else {
                return Double.valueOf(dval);
            }
        } catch (NumberFormatException nfe) {
            throwParseException("Unsupported number format: " + num);
        }
        return null; // unreachable
    }

    private Boolean readTrue() throws ParseException {
        if (length - pos < 3
                || src.charAt(pos) != 'r'
                || src.charAt(pos + 1) != 'u'
                || src.charAt(pos + 2) != 'e') {
            throwParseException("Unexpected token: t");
        }
        pos += 3;
        return Boolean.TRUE;
    }

    private Boolean readFalse() throws ParseException {
        if (length - pos < 4
                || src.charAt(pos) != 'a'
                || src.charAt(pos + 1) != 'l'
                || src.charAt(pos + 2) != 's'
                || src.charAt(pos + 3) != 'e') {
            throwParseException("Unexpected token: f");
        }
        pos += 4;
        return Boolean.FALSE;
    }

    private Object readNull() throws ParseException {
        if (length - pos < 3
                || src.charAt(pos) != 'u'
                || src.charAt(pos + 1) != 'l'
                || src.charAt(pos + 2) != 'l') {
            throwParseException("Unexpected token: n");
        }
        pos += 3;
        return null;
    }

    private void consumeWhitespace() {
        while (pos < length) {
            char c = src.charAt(pos);
            switch (c) {
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                    pos += 1;
                    break;
                default:
                    return;
            }
        }
    }

    private void consume(char token) throws ParseException {
        consumeWhitespace();
        if (pos >= length) {
            throwParseException("Expected " + token + " but reached end of stream");
        }
        char c = src.charAt(pos++);
        if (c == token) {
            return;
        } else {
            throwParseException("Expected " + token + " found " + c);
        }
    }

    private void throwParseException(String message) throws ParseException {
        int backpos = Math.max(pos - 15, 0);
        String previous = " Just read: \"" + src.substring(backpos, pos) + "\"";
        int frontpos = Math.min(pos + 15, length);
        String next = " Still to read: \"" + src.substring(pos, frontpos) + "\"";
        throw new ParseException(message + previous + next);
    }
    
    public static class ParseException extends Exception {
        ParseException(String message) {
            super(message);
        }

        ParseException(Exception cause) {
            super(cause);
        }
    }

}
