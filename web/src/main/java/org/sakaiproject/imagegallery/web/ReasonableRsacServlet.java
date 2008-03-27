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

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import uk.org.ponder.rsac.RSACBeanLocator;
import uk.org.ponder.rsac.servlet.RSACUtils;

/**
 * Avoid possible filter conflicts by bundling the RSACFilter functionality without
 * interfering with anything else in web.xml.
 * Like ReasonableSpringServlet and ReasonableSakaiServlet, we need to copy and paste 
 * uk.org.ponder.rsf.servlet.ReasonableServlet because its RSACBeanLocator is declared private.
 */
public class ReasonableRsacServlet extends HttpServlet {
	private static final Log log = LogFactory.getLog(ReasonableRsacServlet.class);
	protected RSACBeanLocator rsacbeanlocator;
	
	@Override
	public void init(ServletConfig config) {
		ServletContext sc = config.getServletContext();
		WebApplicationContext wac = WebApplicationContextUtils.getWebApplicationContext(sc);
		rsacbeanlocator = (RSACBeanLocator)wac.getBean(RSACBeanLocator.RSAC_BEAN_LOCATOR_NAME);
	}

	@Override
	protected void service(HttpServletRequest request,  HttpServletResponse response) {
	    RSACUtils.startServletRequest(request, response, rsacbeanlocator,
	            RSACUtils.HTTP_SERVLET_FACTORY);
	        try {
	          rsacbeanlocator.getBeanLocator().locateBean("rootHandlerBean");
	        }
	        catch (Throwable t) {
	          // Catch and log this here because Tomcat's stack rendering is
	          // non-standard and crummy.
	          log.error("Error servicing RSAC request: ", t);
	          if (t instanceof Error) {
	            throw ((Error) t);
	          }
	        }
	        finally {
	          rsacbeanlocator.endRequest();
	        }
	}

}
