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

package org.sakaiproject.imagegallery.service.impl;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.imagegallery.domain.Image;
import org.sakaiproject.imagegallery.domain.ImageFile;
import org.sakaiproject.imagegallery.integration.ContextService;
import org.sakaiproject.imagegallery.integration.FileLibraryService;
import org.sakaiproject.imagegallery.service.ImageGalleryService;
import org.sakaiproject.imagegallery.springutil.BaseJdbcServiceImpl;
import org.springframework.jdbc.core.PreparedStatementCreatorFactory;
import org.springframework.jdbc.core.simple.ParameterizedRowMapper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 */
public class ImageGalleryServiceImpl extends BaseJdbcServiceImpl implements ImageGalleryService {
	private static final Log log = LogFactory.getLog(ImageGalleryServiceImpl.class);
	private ContextService contextService;
	private PreparedStatementCreatorFactory insertImage;
	private FileLibraryService fileLibraryService;
	
	private ParameterizedRowMapper<Image> imageRowMapper = new ParameterizedRowMapper<Image>() {
		public Image mapRow(ResultSet rs, int rowNum) throws SQLException {
			Image image = new Image();
			image.setId(Long.toString(rs.getLong("ID")));
			image.setTitle(rs.getString("TITLE"));
			image.setDescription(rs.getString("DESCRIPTION"));
			image.setFileId(rs.getString("FILE_ID"));
			return image;
		}
	};

	public void init() {
		super.init();
		insertImage = new PreparedStatementCreatorFactory(
			"insert into IMAGE_GALLERY_IMAGE_T (CONTEXT, TITLE, DESCRIPTION, FILE_ID) values (?, ?, ?, ?)",
			new int[] {Types.VARCHAR, Types.VARCHAR, Types.LONGVARCHAR, Types.VARCHAR});
	}

	@Transactional(readOnly = true)
	public List<Image> getImages() {
		String currentContext = contextService.getCurrentContextUid();
		List<Image> images = jdbcTemplate.query(
			"select * from IMAGE_GALLERY_IMAGE_T where CONTEXT=?",
			imageRowMapper,
			currentContext
		);
		for (Image image : images) {
			image.setImageFile(fileLibraryService.getImageFile(image.getFileId()));
		}
		return images;
	}

	public Image getImage(String id) {
		Image image = jdbcTemplate.queryForObject(
			"select * from IMAGE_GALLERY_IMAGE_T where ID=?",
			imageRowMapper,
			Long.parseLong(id)
		);
		image.setImageFile(fileLibraryService.getImageFile(image.getFileId()));
		return image;
	}

	@Transactional
	public Image addImage(MultipartFile uploadedFile) {
		final String currentContext = contextService.getCurrentContextUid();
		if (log.isDebugEnabled()) log.debug("About to add image context=" + currentContext + ", file=" + uploadedFile);
		ImageFile storedFile = fileLibraryService.storeImageFile(uploadedFile);
		String fileId = storedFile.getFileId();
		Image image = new Image();
		image.setTitle(storedFile.getFilename());
		image.setDescription("");
		image.setFileId(fileId);
		image.setImageFile(storedFile);
		Long generatedId = jdbcTemplate.insertAndReturnGeneratedId(insertImage, "ID", 
			new Object[] {currentContext, storedFile.getFilename(), "", fileId});
		image.setId(generatedId.toString());
		if (log.isDebugEnabled()) log.debug("new image ID=" + image.getId() + ", fileId=" + image.getFileId());
		return image;
	}

	@Transactional
	public void updateImage(Image image) {
		jdbcTemplate.update(
			"update IMAGE_GALLERY_IMAGE_T set TITLE=?, DESCRIPTION=? where ID=?",
			image.getTitle(),
			image.getDescription(),
			image.getId());
	}

	public void setContextService(ContextService contextService) {
		this.contextService = contextService;
	}
	public void setFileLibraryService(FileLibraryService fileLibraryService) {
		this.fileLibraryService = fileLibraryService;
	}
}
