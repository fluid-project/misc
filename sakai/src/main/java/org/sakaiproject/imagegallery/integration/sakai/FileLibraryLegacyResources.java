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

package org.sakaiproject.imagegallery.integration.sakai;

import java.io.IOException;

import org.apache.commons.io.FilenameUtils;
import org.sakaiproject.content.api.ContentCollection;
import org.sakaiproject.content.api.ContentCollectionEdit;
import org.sakaiproject.content.api.ContentHostingService;
import org.sakaiproject.content.api.ContentResource;
import org.sakaiproject.content.api.ContentResourceEdit;
import org.sakaiproject.entity.api.ContextObserver;
import org.sakaiproject.entity.api.ResourceProperties;
import org.sakaiproject.exception.IdInvalidException;
import org.sakaiproject.exception.IdLengthException;
import org.sakaiproject.exception.IdUniquenessException;
import org.sakaiproject.exception.IdUnusedException;
import org.sakaiproject.exception.IdUsedException;
import org.sakaiproject.exception.InconsistentException;
import org.sakaiproject.exception.OverQuotaException;
import org.sakaiproject.exception.PermissionException;
import org.sakaiproject.exception.ServerOverloadException;
import org.sakaiproject.exception.TypeException;
import org.sakaiproject.imagegallery.domain.ImageFile;
import org.sakaiproject.imagegallery.integration.ContextService;
import org.sakaiproject.imagegallery.integration.FileLibraryService;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 */
public class FileLibraryLegacyResources implements FileLibraryService {
	private ContentHostingService contentHostingService;
	private ContextService contextService;
	private String galleryCollectionName;

	public ImageFile getImageFile(String fileId) {
		try {
			ContentResource resource = contentHostingService.getResource(fileId);
			return mapResourceToImageFile(resource);
		} catch (PermissionException e) {
			throw new RuntimeException(e);
		} catch (IdUnusedException e) {
			throw new RuntimeException(e);
		} catch (TypeException e) {
			throw new RuntimeException(e);
		}
	}

	/* (non-Javadoc)
	 * @see org.sakaiproject.imagegallery.integration.FileLibraryService#storeImageFile(java.io.File)
	 */
	public ImageFile storeImageFile(MultipartFile sourceImageFile) {
		String filename = sourceImageFile.getOriginalFilename();
		String collectionId = getSiteCollectionId(galleryCollectionName);
		try {
			ContentResourceEdit resource = contentHostingService.addResource(collectionId, 
					FilenameUtils.getBaseName(filename),
					FilenameUtils.getExtension(filename), 500);
			resource.setContentType(sourceImageFile.getContentType());
			resource.setContent(sourceImageFile.getInputStream());
			contentHostingService.commitResource(resource);
			return mapResourceToImageFile(resource);
		} catch (PermissionException e) {
			throw new RuntimeException(e);
		} catch (IdUniquenessException e) {
			throw new RuntimeException(e);
		} catch (IdLengthException e) {
			throw new RuntimeException(e);
		} catch (IdInvalidException e) {
			throw new RuntimeException(e);
		} catch (IdUnusedException e) {
			throw new RuntimeException(e);
		} catch (OverQuotaException e) {
			throw new RuntimeException(e);
		} catch (ServerOverloadException e) {
			throw new RuntimeException(e);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
	
	private ImageFile mapResourceToImageFile(ContentResource resource) {
		ImageFile imageFile = new ImageFile();
		imageFile.setContentType(resource.getContentType());
		imageFile.setDataUrl(resource.getUrl(false));
		imageFile.setFileId(resource.getId());
		imageFile.setFilename(FilenameUtils.getName(resource.getId()));
		return imageFile;
	}
	
	/**
	 * Construct the collection ID and create it if it doesn't already exist.
	 */
	private String getSiteCollectionId(String subfolder) {
		String context = contextService.getCurrentContextUid();
		String siteCollectionId = contentHostingService.getSiteCollection(context);
		String collectionId = siteCollectionId + subfolder + "/";

		if (!isCollectionCreated(collectionId)) {
			// First ensure that the top-level site resources folder is there.
			if (!isCollectionCreated(siteCollectionId)) {
				// We may not be _the_ Resources tool, but we're _a_ Resources tool.
				((ContextObserver)contentHostingService).contextUpdated(context, true);
			}
			createCollection(collectionId, subfolder);
		}
		
		return collectionId;
	}
	
	private boolean isCollectionCreated(String collectionId) {
		ContentCollection collection;
		try {
			collection = contentHostingService.getCollection(collectionId);
		} catch (IdUnusedException e) {
			collection = null;
		} catch (TypeException e) {
			throw new RuntimeException(e);
		} catch (PermissionException e) {
			throw new RuntimeException(e);
		}
		return (collection != null);
	}
	
	private ContentCollection createCollection(String collectionId, String collectionName) {
		try {
			
			// Have I mentioned lately how much I hate this Obj / ObjEdit business?
			ContentCollectionEdit collectionEdit = contentHostingService.addCollection(collectionId);
			
			// The folder will show up in Resources with no name unless
			// we explicitly set one.
			collectionEdit.getPropertiesEdit().addProperty(ResourceProperties.PROP_DISPLAY_NAME, collectionName);
			
			contentHostingService.commitCollection(collectionEdit);
			return collectionEdit;
		} catch (IdUsedException e) {
			throw new RuntimeException(e);
		} catch (IdInvalidException e) {
			throw new RuntimeException(e);
		} catch (PermissionException e) {
			throw new RuntimeException(e);
		} catch (InconsistentException e) {
			throw new RuntimeException(e);
		}
	}

	public void setGalleryCollectionName(String galleryCollectionName) {
		this.galleryCollectionName = galleryCollectionName;
	}

	public void setContentHostingService(ContentHostingService contentHostingService) {
		this.contentHostingService = contentHostingService;
	}

	public void setContextService(ContextService contextService) {
		this.contextService = contextService;
	}

}
