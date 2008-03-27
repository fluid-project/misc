/**********************************************************************************
*
* $Id$
*
***********************************************************************************
* Based on http://jira.springframework.org/secure/attachment/11260/jira-1197.patch
* Should be replaced by real Spring class if it ever gets in.
**********************************************************************************/
/*
 * Copyright 2002-2005 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.sakaiproject.imagegallery.springutil;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.dao.UncategorizedDataAccessException;

/**
 * Parses a textual SQL script containing a group of database commands separated
 * by semi-colons and converts it into an array of {@link String}s, suitable
 * for processing through JDBC or any other desired mechanism. <p/> This code is
 * based loosely on source code from the <i>Apache Ant</i> project at: <p/>
 * <code>http://ant.apache.org/index.html</code> <p/> As mentioned, multiple
 * statements can be provided, separated by semi-colons. Lines within the script
 * can be commented using either "--" or "//". Comments extend to the end of the
 * line.
 */
public class SqlScriptParser {
	/**
	 * The logger class.
	 */
	private static final Log s_log = LogFactory.getLog(SqlScriptParser.class);

	/**
	 * Parse the SQL script to produce an array of database statements.
	 * @param sqlScriptReader A reader that reads the SQL script text.
	 * @return An array of strings, each containing a single statement.
	 * @throws RuntimeException-wrapped IOException if the script cannot be read.
	 * @throws RuntimeException-wrapped ParseException if the script cannot be parsed.
	 */
	public static String[] parse(Reader sqlScriptReader) {
		char statementDelimiter = ';';
		List<String> statements = new ArrayList<String>();

		StringBuffer sql = new StringBuffer(1024);
		String line = "";
		BufferedReader in = new BufferedReader(sqlScriptReader);
		int lineNumber = 0;

		// Read each line and build up statements.
		try {
			while ((line = in.readLine()) != null) {
				lineNumber++;
				// Trim
				line = cleanLine(line);
				
				// Check for statement delimiter change.
				Character newDelimiter = parseForNewStatementDelimiter(line);
				if (newDelimiter != null) {
					statementDelimiter = newDelimiter.charValue();
					continue;
				}
				
				// Validate and strip comments
				parseLine(line, sql, lineNumber, statementDelimiter);
				if (sql.length() > 0) {
					if (sql.charAt(sql.length() - 1) == statementDelimiter) {
						// This line terminates the statement.
						// Lose the delimiter.
						String statement = sql.toString().substring(0, sql.length() - 1).trim();
						if (statement.length() > 0) {
							statements.add(statement);
							s_log.debug("Found statement: " + statement);
						}
						// Clear buffer for the next statement.
						sql.replace(0, sql.length(), "");
					} else {
						// This line does not terminate the statement. Add a
						// space and go on to the next one.
						sql.append(" ");
					}
				}
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}

		// Catch any statements not followed by delimiter.
		String orphanStatement = sql.toString().trim();
		if (orphanStatement.length() > 0) {
			statements.add(orphanStatement);
			s_log.debug("Found statement: " + orphanStatement);
		}

		String[] result = new String[statements.size()];
		statements.toArray(result);
		return result;
	}
	
	private static String cleanLine(String line) {
		if (line == null) {
			throw new IllegalArgumentException("Object cannot be null.");
		}
		// Must be a single line of text.
		if (line.indexOf("\n") >= 0 || line.indexOf("\r") >= 0 || line.indexOf("\f") >= 0) {
			// This is a programmer error, not a parse error, so throw
			// IllegalArgumentException.
			throw new IllegalArgumentException(
					"Line string may not embed new lines, form feeds, or carriage returns.");
		}

		line = line.trim();

		return line;
	}

	/**
	 * Parse a line of text to remove comments.
	 * @param line The line to parse. The string must not have any new line,
	 *            carriage return, or form feed characters. It also may not
	 *            contain a double-quote outside of a string literal, and the
	 *            statement delimiter character may only appear at the end of
	 *            the line.
	 * @param sql String buffer that stores the result, which is appended to the
	 *            end. When the method returns, it will contain the trimmed line
	 *            with comments removed. If the line contains no usable SQL
	 *            fragment, nothing is appended.
	 * @param lineNumber Line number used for exceptions.
	 * @throws ParseException 
	 * @throws IllegalArgumentException if the line is null or contains one of
	 *             the line terminating characters mentioned above.
	 * @throws UncategorizedDataAccessException if parsing fails for some other reason.
	 */
	private static void parseLine(String line, StringBuffer sql, int lineNumber, char statementDelimiter) {

		// Parse line looking for single quote string delimiters. Anything
		// that's part of a string just passes through.
		StringTokenizer quoteTokenizer = new StringTokenizer(line, "'", true);
		// true if we're parsing through a string literal.
		boolean inLiteral = false;

		while (quoteTokenizer.hasMoreTokens()) {
			String token = quoteTokenizer.nextToken();
			if (token.equals("'")) {
				// Token is a string delimiter. Toggle "inLiteral" flag.
				inLiteral = !inLiteral;
			} else if (!inLiteral) {
				// Look for EOL comments.
				int commentIndex = indexOfComment(token);
				if (commentIndex >= 0) {
					// Truncate token to the comment marker.
					token = token.substring(0, commentIndex).trim();
				}

				// Thwart any attempt to use double-quote outside of a string
				// literal.
				if (token.indexOf("\"") >= 0) {
					throw new RuntimeException(new ParseException("Double quote character"
							+ " cannot be used in a string literal.", token.indexOf("\"")));
				}
				// Thwart any attempt to have the statement delimiter embedded
				// in a line. Not supported at this point.
				int statementEndIndex = token.indexOf(statementDelimiter);
				if (statementEndIndex >= 0 && statementEndIndex != (token.length() - 1)) {
					throw new RuntimeException(new ParseException("SQL statement delimiter"
							+ " embedded in a line. (Not supported at this point)", statementEndIndex));
				}

				// If we've hit a comment, we're done with this line. Just
				// append the token and break out.
				if (commentIndex >= 0) {
					sql.append(token);
					break;
				}

			} // Else, we're in a string literal. Just let it pass through.
			sql.append(token);
		}

		if (inLiteral) {
			// If the inLiteral flag is set here, the line has an unterminated
			// string literal.
			throw new RuntimeException(new ParseException("Unterminated string literal.", 0));
		}
	}

	/**
	 * Return the index of the fist comment marker in the string. Comment
	 * markers are "--" and "//".
	 * @param s The string to search.
	 * @return The index of the first occurrence of a comment marker or -1 if no
	 *         marker is found.
	 */
	private static int indexOfComment(String s) {
		int comment1Index = s.indexOf("//");
		int comment2Index = s.indexOf("--");
		int result;
		if (comment1Index >= 0) {
			if (comment2Index >= 0) {
				result = Math.min(comment2Index, comment1Index);
			} else {
				result = comment1Index;
			}
		} else {
			result = comment2Index;
		}
		return result;
	}
	
	/**
	 * Add primitive support for a few common ways of changing the statement
	 * terminator from the usual ";". This is particularly useful for Oracle DDL:
	 * 
	 * <pre> set terminator off
	 * create or replace trigger IMAGE_GALLERY_IMAGE_TRIGGER
	 * before insert on IMAGE_GALLERY_IMAGE_T
	 *   for each row when (NEW.ID is null)
	 *   begin
	 *     select IMAGE_GALLERY_IMAGE_S.NEXTVAL into :NEW.ID from dual;
	 *   end;
	 * / </pre>
	 * 
	 * @return the new character to terminate statements or null if the line
	 * had nothing to do with statement delimiters.
	 */
	private static Character parseForNewStatementDelimiter(String line) {
		Character newDelimiter = null;
		String statement = line.toUpperCase();
		if (statement.startsWith("SET SQLTERMINATOR ")) {
			// Oracle conventions: "OFF" will make the parser ignore semicolons,
			// but continue to take a slash ("/") as the signal to execute
			// the statement or block. "ON" will make the parser notice
			// whatever the usual terminator is. Any other value will be
			// taken as the new terrminator character.
			if (statement.endsWith("OFF")) {
				newDelimiter = Character.valueOf('/');
			} else if (statement.endsWith("ON")) {
				newDelimiter = Character.valueOf(';');
			} else {
				newDelimiter = Character.valueOf(line.charAt(line.length() - 1));
			}
		} else if (statement.startsWith("--#SET TERMINATOR ")) {
			// DB2 conventions.
			newDelimiter = Character.valueOf(line.charAt(line.length() - 1));
		}
		
		return newDelimiter;
	}
}
