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

import java.io.IOException;
import java.io.InputStreamReader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.context.ResourceLoaderAware;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.simple.SimpleJdbcDaoSupport;

/**
 *
 */
public class SqlScriptRunner extends SimpleJdbcDaoSupport implements ResourceLoaderAware {
	private static final Log log = LogFactory.getLog(SqlScriptRunner.class);
	private String sqlResourcePath;
	private boolean automatic;
	private boolean continueOnError;
	private boolean failQuietlyOnError;
	private ResourceLoader resourceLoader;

	public void init() {
		if (automatic) {
			executeScript();
		}
	}
	
	public void executeScript() {
		if (log.isInfoEnabled()) log.info("Executing SQL script '" + sqlResourcePath + "'");
		Resource sqlResource = resourceLoader.getResource(sqlResourcePath);
		String[] sqlStatements;
		try {
			sqlStatements = SqlScriptParser.parse(new InputStreamReader(sqlResource.getInputStream()));
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		for (int i = 0; i < sqlStatements.length; i++) {
			try {
				getJdbcTemplate().execute(sqlStatements[i]);
			} catch (DataAccessException e) {
				if (continueOnError) {
					if (log.isDebugEnabled()) {
						log.debug("SQL: " + sqlStatements[i] + " failed; continuing", e);
					} else if (log.isInfoEnabled()) {
						log.info("SQL: " + sqlStatements[i] + " failed on exeception; " + e.getMessage() + ", continuing");
					}
				} else if (failQuietlyOnError) {
					if (log.isDebugEnabled()) {
						log.debug("SQL: " + sqlStatements[i] + " failed; stopping", e);
					} else if (log.isInfoEnabled()) {
						log.info("SQL: " + sqlStatements[i] + " failed on exeception; " + e.getMessage() + ", stopping");
					}
					return;
				} else {
					throw e;
				}
			}
		}
		if (log.isInfoEnabled()) log.info("Done executing SQL script '" + sqlResourcePath + "'");
	}

	public void setAutomatic(boolean automatic) {
		this.automatic = automatic;
	}

	public void setSqlResourcePath(String sqlResourcePath) {
		this.sqlResourcePath = sqlResourcePath;
	}

	public void setContinueOnError(boolean continueOnError) {
		this.continueOnError = continueOnError;
	}

	public void setFailQuietlyOnError(boolean failQuietlyOnError) {
		this.failQuietlyOnError = failQuietlyOnError;
	}

	public void setResourceLoader(ResourceLoader resourceLoader) {
		this.resourceLoader = resourceLoader;
	}

}
