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

package org.sakaiproject.imagegallery.web;

import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;

/**
 *
 */
public class SwfMultipartResolver extends CommonsMultipartResolver {
	private static final Log log = LogFactory.getLog(SwfMultipartResolver.class);
	private static final String BADLY_CASED_KEY = "Filedata";
	private static final String FIXED_KEY = "fileData";

	@SuppressWarnings("unchecked")
	@Override
	protected MultipartParsingResult parseFileItems(List fileItems, String encoding) {
		MultipartParsingResult result = super.parseFileItems(fileItems, encoding);
		Map multipartFiles = result.getMultipartFiles();
		Object value = multipartFiles.get(BADLY_CASED_KEY);
		if (value != null) {
			if (log.isInfoEnabled()) log.info("Got badly cased key '" + BADLY_CASED_KEY + "', changing to " + FIXED_KEY);
			multipartFiles.remove(BADLY_CASED_KEY);
			multipartFiles.put(FIXED_KEY, value);
		}
		return result;
	}

}
