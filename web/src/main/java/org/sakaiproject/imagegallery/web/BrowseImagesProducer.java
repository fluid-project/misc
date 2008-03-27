package org.sakaiproject.imagegallery.web;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.imagegallery.domain.Image;

import uk.org.ponder.beanutil.entity.EntityID;
import uk.org.ponder.rsf.components.UIBranchContainer;
import uk.org.ponder.rsf.components.UIContainer;
import uk.org.ponder.rsf.components.UIForm;
import uk.org.ponder.rsf.components.UIInternalLink;
import uk.org.ponder.rsf.components.UILink;
import uk.org.ponder.rsf.components.UIOutput;
import uk.org.ponder.rsf.view.ComponentChecker;
import uk.org.ponder.rsf.view.DefaultView;
import uk.org.ponder.rsf.view.ViewComponentProducer;
import uk.org.ponder.rsf.viewstate.EntityCentredViewParameters;
import uk.org.ponder.rsf.viewstate.SimpleViewParameters;
import uk.org.ponder.rsf.viewstate.ViewParameters;

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

/**
 *
 */
public class BrowseImagesProducer extends AbstractViewProducer implements ViewComponentProducer, DefaultView {
	private static final Log log = LogFactory.getLog(BrowseImagesProducer.class);

	public void fillComponents(UIContainer tofill, ViewParameters viewparams, ComponentChecker checker) {
		String galleryName = "All Images";
		UIInternalLink.make(tofill, "addImage-link", new SimpleViewParameters(getProducerViewID(AddImageProducer.class)));
		UIOutput.make(tofill, "gallery-name", galleryName);
		UIForm imageForm = UIForm.make(tofill, "image-form");
		List<Image> images = imageLocator.getImages();
		for (Image image : images) {
			UIBranchContainer imageRecordDiv = UIBranchContainer.make(imageForm, "image-record:");
			UIOutput.make(imageRecordDiv, "image-title", image.getTitle());
			UILink.make(imageRecordDiv, "image-image", image.getImageFile().getDataUrl());
			
			// We allow null description fields, but if RSF gets a null string it displays the template text.
			// TODO Ask for more explicit control over null handling.
			UIOutput.make(imageRecordDiv, "image-description", StringUtils.defaultString(image.getDescription()));
			
			UIInternalLink.make(imageRecordDiv, "view-image-link", 
				new EntityCentredViewParameters(getProducerViewID(ViewImageProducer.class), 
					new EntityID("Image", image.getId().toString())));
		}
	}
}
