/**********************************************************************************
*
* $Id$
*
***********************************************************************************
*
* Copyright (c) 2008 The Regents of the University of California
*
* Licensed under the Educational Community License, Version 1.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.opensource.org/licenses/ecl1.php
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
**********************************************************************************/

package org.sakaiproject.imagegallery.springutil;

import javax.sql.DataSource;

import org.springframework.jdbc.core.PreparedStatementCreatorFactory;
import org.springframework.jdbc.core.simple.SimpleJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

/**
 *
 */
public class BaseJdbcTemplate extends SimpleJdbcTemplate {

	public BaseJdbcTemplate(DataSource dataSource) {
		super(dataSource);
	}

	/**
	 * The default implementation assumes that the DB vendor and table definition
	 * support JDBC 3.0 generated keys. Non-JDBC-3.0 DBs will need to hack another
	 * implementation of this method.
	 * 
	 * @param pscf object that provides SQL and the types of any required parameters
	 * @param keyColumnName not used by some non-JDBC-3.0 DBs; needed for Oracle
	 * even if there's only one candidate column since otherwise ROWNUM is returned
	 * @param args the parameters for the query
	 * @return the generated ID for the new record
	 */
	public Long insertAndReturnGeneratedId(PreparedStatementCreatorFactory pscf, String keyColumnName, Object... args) {
		pscf.setGeneratedKeysColumnNames(new String[] {keyColumnName});
		KeyHolder keyHolder = new GeneratedKeyHolder();
		getJdbcOperations().update(
			pscf.newPreparedStatementCreator(args),
			keyHolder);
		return new Long(keyHolder.getKey().longValue());
	}
}
