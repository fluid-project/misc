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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.imagegallery.domain.Image;
import org.sakaiproject.imagegallery.service.ImageGalleryService;

import uk.org.ponder.beanutil.BeanLocator;

/**
 * 
 */
public class ImageLocator implements BeanLocator {
	private static final Log log = LogFactory.getLog(ImageLocator.class);
	private Map<String, Image> idToImageMap = new HashMap<String, Image>();
	private ImageGalleryService imageGalleryService;

	public Image locateBean(String name) {
		if (log.isDebugEnabled()) log.debug("locateBean " + name);
		return getImage(name);
	}
	
	public Image getImage(String id) {
		Image image = idToImageMap.get(id);
		if (image == null) {
			image = imageGalleryService.getImage(id);
			idToImageMap.put(id, image);
		}
		return image;
	}
	
	public List<Image> getImages() {
		return imageGalleryService.getImages();
	}

	public void saveAction() {
		for (Image image : idToImageMap.values()) {
			if (log.isDebugEnabled()) log.debug("save image id=" + image.getId() + ", title=" + image.getTitle() + ", description=" + image.getDescription());
			imageGalleryService.updateImage(image);
		}
	}
	
	public List<String> getWorkingImageIds() {
		return new ArrayList<String>(idToImageMap.keySet());
	}

	public void setToolService(ImageGalleryService imageGalleryService) {
		this.imageGalleryService = imageGalleryService;
	}
}
