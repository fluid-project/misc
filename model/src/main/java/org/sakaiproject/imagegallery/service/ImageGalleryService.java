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

package org.sakaiproject.imagegallery.service;

import java.util.List;

import org.sakaiproject.imagegallery.domain.Image;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 */
public interface ImageGalleryService {
	/**
	 * @return imaages in current context
	 */
	public List<Image> getImages();
	
	/**
	 * @param id
	 * @return image record or null if not found
	 */
	public Image getImage(String id);
	
	/**
	 * Add a new image to the current context.
	 */
	public Image addImage(MultipartFile uploadedFile);
	
	public void updateImage(Image image);
}
