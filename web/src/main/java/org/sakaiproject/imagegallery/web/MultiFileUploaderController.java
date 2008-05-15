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

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.imagegallery.domain.Image;
import org.sakaiproject.imagegallery.service.ImageGalleryService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.multiaction.MultiActionController;
import org.springframework.web.servlet.view.RedirectView;

/**
 *
 */
public class MultiFileUploaderController extends MultiActionController {
	private static final Log log = LogFactory.getLog(MultiFileUploaderController.class);
	private ImageGalleryService imageGalleryService;

	public void multiFileUpload(HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (log.isInfoEnabled()) log.info("req contextPath=" + request.getContextPath() + ", pathInfo=" + request.getPathInfo() + 
				", query=" + request.getQueryString() + ", URI=" + request.getRequestURI() + ", URL=" + request.getRequestURL() + ", servlet=" + request.getServletPath());
		if (request instanceof MultipartHttpServletRequest) {
			String newImageId = storeNewImage((MultipartHttpServletRequest)request);
			response.setContentType("text/plain");
			PrintWriter responseWriter = response.getWriter();
			responseWriter.print(newImageId);
			responseWriter.close();
		}
	}

	public ModelAndView singleFileUpload(HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (log.isInfoEnabled()) log.info("req contextPath=" + request.getContextPath() + ", pathInfo=" + request.getPathInfo() + 
				", query=" + request.getQueryString() + ", URI=" + request.getRequestURI() + ", URL=" + request.getRequestURL() + ", servlet=" + request.getServletPath());
		if (request instanceof MultipartHttpServletRequest) {
			return new ModelAndView(new RedirectView("/site/AddInformationToImages?imageIds=" + 
				storeNewImage((MultipartHttpServletRequest)request), true));
		}
		
		return null;
	}
	
	private String storeNewImage(MultipartHttpServletRequest multipartRequest) {
		MultipartFile file = multipartRequest.getFile("fileData");
		Image image = imageGalleryService.addImage(file);
		return image.getId();		
	}

	public void setImageGalleryService(ImageGalleryService imageGalleryService) {
		this.imageGalleryService = imageGalleryService;
	}

}
