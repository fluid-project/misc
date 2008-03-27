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

/**
 *
 */
public class BaseJdbcServiceImpl {
	protected BaseJdbcTemplate jdbcTemplate;
	protected DataSource dataSource;
	protected String jdbcDialect;

	public void init() {
		if (HsqlJdbcTemplate.DIALECT.equals(jdbcDialect)) {
			jdbcTemplate = new HsqlJdbcTemplate(dataSource);
		} else {
			jdbcTemplate = new BaseJdbcTemplate(dataSource);
		}
	}
	
	public void setDataSource(DataSource dataSource) {
		this.dataSource = dataSource;
	}
	public void setJdbcDialect(String jdbcDialect) {
		this.jdbcDialect = jdbcDialect;
	}
}
