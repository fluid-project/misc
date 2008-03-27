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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.imagegallery.domain.Image;

import uk.org.ponder.beanutil.entity.EntityID;
import uk.org.ponder.rsf.components.UICommand;
import uk.org.ponder.rsf.components.UIContainer;
import uk.org.ponder.rsf.components.UIForm;
import uk.org.ponder.rsf.components.UIInput;
import uk.org.ponder.rsf.components.UIInternalLink;
import uk.org.ponder.rsf.components.UILink;
import uk.org.ponder.rsf.components.UIOutput;
import uk.org.ponder.rsf.flow.jsfnav.NavigationCase;
import uk.org.ponder.rsf.flow.jsfnav.NavigationCaseReporter;
import uk.org.ponder.rsf.view.ComponentChecker;
import uk.org.ponder.rsf.view.ViewComponentProducer;
import uk.org.ponder.rsf.viewstate.EntityCentredViewParameters;
import uk.org.ponder.rsf.viewstate.SimpleViewParameters;
import uk.org.ponder.rsf.viewstate.ViewParameters;
import uk.org.ponder.rsf.viewstate.ViewParamsReporter;

/**
 *
 */
public class AddInformationToImagesProducer extends AbstractViewProducer implements ViewComponentProducer, NavigationCaseReporter, ViewParamsReporter {
	private static final Log log = LogFactory.getLog(AddInformationToImagesProducer.class);

	public void fillComponents(UIContainer tofill, ViewParameters viewparams, ComponentChecker checker) {
		UIInternalLink.make(tofill, "browseImages-link", new SimpleViewParameters(getProducerViewID(BrowseImagesProducer.class)));
		EntityCentredViewParameters entityParameters = (EntityCentredViewParameters)viewparams;
		if (log.isDebugEnabled()) log.debug("ELPath=" + entityParameters.getELPath());
		Image image = imageLocator.getImage(entityParameters.entity.ID);
		String imageLocatorPath = entityParameters.entity.entityname;
		String imagePath = entityParameters.getELPath();
		UIForm imageForm = UIForm.make(tofill, "image-form");
		UILink.make(imageForm, "image-image", image.getImageFile().getDataUrl());
		UIInput.make(imageForm, "image-title", "#{" + imagePath + ".title}");
		UIOutput.make(imageForm, "image-filename", image.getImageFile().getFilename());
		UIInput.make(imageForm, "image-description", "#{" + imagePath + ".description}");
		UICommand.make(imageForm, "image-save", "#{" + imageLocatorPath + ".saveAction}");
		UICommand.make(imageForm, "image-cancel");
	}

	public List<NavigationCase> reportNavigationCases() {
		return getSimpleNavigationCase(BrowseImagesProducer.class);
	}
	
	public ViewParameters getViewParameters() {
		return new EntityCentredViewParameters(getViewID(), new EntityID("Image", null));
	}
}
