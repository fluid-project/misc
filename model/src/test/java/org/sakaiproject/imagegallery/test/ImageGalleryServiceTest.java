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

package org.sakaiproject.imagegallery.test;

import java.util.List;

import org.easymock.EasyMock;
import org.sakaiproject.imagegallery.domain.Image;
import org.sakaiproject.imagegallery.domain.ImageFile;
import org.sakaiproject.imagegallery.integration.ContextService;
import org.sakaiproject.imagegallery.service.ImageGalleryService;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.AbstractTransactionalDataSourceSpringContextTests;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 */
public class ImageGalleryServiceTest extends AbstractTransactionalDataSourceSpringContextTests {
	private ImageGalleryService imageGalleryService;
	private ContextService contextService;

	@Override
	protected String[] getConfigLocations() {
		return new String[] {"META-INF/spring/spring-service.xml",
			"META-INF/spring/spring-test-datasource.xml",
			"META-INF/spring/spring-mock-integration.xml"};
	}

	@Override
	protected void onSetUpBeforeTransaction() throws Exception {
		contextService = (ContextService)applicationContext.getBean(ContextService.class.getName());
		setCurrentContext("MySite");
	}

	public void testGetImages() {
		List<Image> images = imageGalleryService.getImages();
		assertEquals(0, images.size());
		
		imageGalleryService.addImage(getMockMultipartFile("first"));
		images = imageGalleryService.getImages();
		assertEquals(1, images.size());
		Image image = images.get(0);
		assertEquals("first.jpg", image.getTitle());
		ImageFile imageFile = image.getImageFile();
		assertEquals("first.jpg", imageFile.getFilename());
		// assertEquals("First Description", image.getDescription());
		assertEquals("image/jpeg", imageFile.getContentType());
	}
	
	public void testDefaultTitle() {
		Image image = imageGalleryService.addImage(getMockMultipartFile("first"));
		assertEquals("first.jpg", image.getTitle());
	}

	public void testUpdateImage() {
		for (int i = 0; i < 2; i++) {
			imageGalleryService.addImage(getMockMultipartFile("image" + i));
		}
		List<Image> images = imageGalleryService.getImages();
		String foundImageId = null;
		for (Image image : images) {
			if (image.getTitle().equals("image1.jpg")) {
				foundImageId = image.getId();
				image.setTitle("New Image 1");
				image.setDescription("New description");
				imageGalleryService.updateImage(image);
			}
		}
		assertNotNull(foundImageId);
		Image foundImage = imageGalleryService.getImage(foundImageId);
		assertEquals("New Image 1", foundImage.getTitle());
		assertEquals("New description", foundImage.getDescription());
	}
	
	public void testContextualImages() {
		// Add an image to the default site context.
		String defaultSiteContext = contextService.getCurrentContextUid();
		imageGalleryService.addImage(getMockMultipartFile("mysite"));
		
		// Now switch site contexts.
		setCurrentContext("AnotherSite");
		imageGalleryService.addImage(getMockMultipartFile("anothersite"));
		List<Image> images = imageGalleryService.getImages();
		assertEquals(1, images.size());
		assertEquals("anothersite.jpg", images.get(0).getTitle());
		
		// Now switch back again.
		setCurrentContext(defaultSiteContext);
		images = imageGalleryService.getImages();
		boolean foundImage = false;
		for (Image img : imageGalleryService.getImages()) {
			if (img.getTitle().equals("mysite.jpg")) {
				foundImage = true;
			}
		}
		assert(foundImage);
	}

	public void setToolService(ImageGalleryService imageGalleryService) {
		this.imageGalleryService = imageGalleryService;
	}
	
	private void setCurrentContext(String currentContextUid) {
		EasyMock.reset(contextService);
		EasyMock.expect(contextService.getCurrentContextUid()).andReturn(currentContextUid).anyTimes();
		EasyMock.replay(contextService);		
	}
	
	private MultipartFile getMockMultipartFile(String seed) {
		return new MockMultipartFile(seed, seed + ".jpg", "image/jpeg", seed.getBytes());
	}

}
