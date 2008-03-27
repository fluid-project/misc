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

package org.sakaiproject.imagegallery.integration.stub;

import java.util.HashMap;
import java.util.Map;

import org.sakaiproject.imagegallery.domain.ImageFile;
import org.sakaiproject.imagegallery.integration.ContextService;
import org.sakaiproject.imagegallery.integration.FileLibraryService;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 */
public class FileLibraryStub implements FileLibraryService {
	private ContextService contextService;
	private Map<String, ImageFile> idsToFiles = new HashMap<String, ImageFile>();

	/* (non-Javadoc)
	 * @see org.sakaiproject.imagegallery.integration.FileLibraryService#getImageFile(java.lang.String)
	 */
	public ImageFile getImageFile(String fileId) {
		return idsToFiles.get(fileId);
	}

	/* (non-Javadoc)
	 * @see org.sakaiproject.imagegallery.integration.FileLibraryService#storeImageFile(org.springframework.web.multipart.MultipartFile)
	 */
	public ImageFile storeImageFile(MultipartFile sourceImageFile) {
		String filename = sourceImageFile.getOriginalFilename();
		String fileId = "/secretspot/image-gallery/" + contextService.getCurrentContextUid() + "/" + filename;
		ImageFile imageFile = new ImageFile();
		imageFile.setContentType(sourceImageFile.getContentType());
		imageFile.setDataUrl("http://localhost" + fileId);
		imageFile.setFileId(fileId);
		imageFile.setFilename(filename);
		idsToFiles.put(fileId, imageFile);
		return imageFile;
	}

	public void setContextService(ContextService contextService) {
		this.contextService = contextService;
	}

}
