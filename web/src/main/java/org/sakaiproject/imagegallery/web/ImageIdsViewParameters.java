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

import uk.org.ponder.rsf.viewstate.SimpleViewParameters;

public class ImageIdsViewParameters extends SimpleViewParameters {
	public String[] imageIds = new String[0];

	public ImageIdsViewParameters() {
		super();
	}

	public ImageIdsViewParameters(String viewID, String imageId) {
		super(viewID);
		imageIds = new String[]{imageId};
	}
}
