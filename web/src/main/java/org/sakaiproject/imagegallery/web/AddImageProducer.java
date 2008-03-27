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

import java.util.Arrays;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import uk.org.ponder.beanutil.entity.EntityID;
import uk.org.ponder.rsf.components.UICommand;
import uk.org.ponder.rsf.components.UIContainer;
import uk.org.ponder.rsf.components.UIForm;
import uk.org.ponder.rsf.components.UIInternalLink;
import uk.org.ponder.rsf.flow.jsfnav.NavigationCase;
import uk.org.ponder.rsf.flow.jsfnav.NavigationCaseReporter;
import uk.org.ponder.rsf.util.RSFUtil;
import uk.org.ponder.rsf.view.ComponentChecker;
import uk.org.ponder.rsf.view.ViewComponentProducer;
import uk.org.ponder.rsf.viewstate.EntityCentredViewParameters;
import uk.org.ponder.rsf.viewstate.SimpleViewParameters;
import uk.org.ponder.rsf.viewstate.ViewParameters;

/**
 *
 */
public class AddImageProducer extends AbstractViewProducer implements ViewComponentProducer, NavigationCaseReporter {
	private static final Log log = LogFactory.getLog(AddImageProducer.class);

	public void fillComponents(UIContainer tofill, ViewParameters viewparams, ComponentChecker checker) {
		UIInternalLink.make(tofill, "browseImages-link", new SimpleViewParameters(getProducerViewID(BrowseImagesProducer.class)));
		UIForm newImageForm = UIForm.make(tofill, "new-image-form");
		UICommand.make(newImageForm, "new-image-save", "#{Image.uploadAction}");
		
		// This approach doesn't work yet. The source EL is resolved after the upload
		// action, but it's not inserted into the target.
		// TODO If it never works, the line should be deleted.
		RSFUtil.addResultingViewBinding(newImageForm, "entity.ID", "#{Image.newImageId}");
	}
	
	public List<NavigationCase> reportNavigationCases() {
		return Arrays.asList(new NavigationCase[] {new NavigationCase(
			new EntityCentredViewParameters(getProducerViewID(AddInformationToImagesProducer.class),
				new EntityID("Image", null))) 
		});
	}
}
