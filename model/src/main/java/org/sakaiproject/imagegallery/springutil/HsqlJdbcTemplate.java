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

/**
 *
 */
public class HsqlJdbcTemplate extends BaseJdbcTemplate {
	public final static String DIALECT = "hsqldb";

	public HsqlJdbcTemplate(DataSource dataSource) {
		super(dataSource);
	}

	/**
	 * Since hsqldb does not yet implement JDBC 3.0 generated keys,
	 * this does a very rough simulation via auto-generated ID
	 * and the vendor-specific "call identity()" statement.
	 *
	 * WARNING: The key column name won't be checked against the
	 * actual name of the identity column. This method simply
	 * assumes it's correct.
	 * 
	 * @param keyColumnName not used in this implementation and can be null
	 */
	@Override
	public Long insertAndReturnGeneratedId(PreparedStatementCreatorFactory pscf, String keyColumnName, Object... args) {
		getJdbcOperations().update(pscf.newPreparedStatementCreator(args));
		return queryForLong("call identity()");
	}

}
