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

package org.sakaiproject.imagegallery.integration;

import org.sakaiproject.imagegallery.domain.ImageFile;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 */
public interface FileLibraryService {
	
	public ImageFile getImageFile(String fileId);
	
	/**
	 * Import the image file into the default file library location for the Image Gallery
	 * in the current context, defaulting the resource name to the file name and deriving
	 * its MIME type from the file extension.
	 * 
	 * @param sourceImageFile
	 * @return information needed to work with file hereafter
	 */
	public ImageFile storeImageFile(MultipartFile sourceImageFile);
}
