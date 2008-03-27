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

package org.sakaiproject.imagegallery.integration.standalone;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.imagegallery.domain.ImageFile;
import org.sakaiproject.imagegallery.integration.ContextService;
import org.sakaiproject.imagegallery.integration.FileLibraryService;
import org.sakaiproject.imagegallery.springutil.BaseJdbcServiceImpl;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.support.AbstractLobCreatingPreparedStatementCallback;
import org.springframework.jdbc.core.support.AbstractLobStreamingResultSetExtractor;
import org.springframework.jdbc.support.lob.DefaultLobHandler;
import org.springframework.jdbc.support.lob.LobCreator;
import org.springframework.jdbc.support.lob.LobHandler;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 */
public class FileLibraryStandalone extends BaseJdbcServiceImpl implements FileLibraryService, FileStreamer {
	private static final Log log = LogFactory.getLog(FileLibraryStandalone.class);
	private ContextService contextService;
	private String urlPrefix;
	private final LobHandler lobHandler = new DefaultLobHandler();

	/**
	 * @see org.sakaiproject.imagegallery.integration.FileLibraryService#getImageFile(java.lang.String)
	 */
	@Transactional(readOnly = true)
	public ImageFile getImageFile(String fileId) {
		String contentType = jdbcTemplate.queryForObject(
			"select CONTENT_TYPE from IMAGE_GALLERY_STANDALONE_FILES_T where FILE_ID=?",
			String.class,
			fileId);
		ImageFile imageFile = new ImageFile();
		imageFile.setContentType(contentType);
		imageFile.setFilename(FilenameUtils.getName(fileId));
		imageFile.setFileId(fileId);
		imageFile.setDataUrl(urlPrefix + fileId);
		return imageFile;
	}

	/**
	 * @see org.sakaiproject.imagegallery.integration.FileLibraryService#storeImageFile(org.springframework.web.multipart.MultipartFile)
	 */
	@Transactional
	public ImageFile storeImageFile(final MultipartFile sourceImageFile) {
		final String filename = sourceImageFile.getOriginalFilename();
		final String fileId = contextService.getCurrentContextUid() + "/" + filename;
		final String contentType = sourceImageFile.getContentType();
		
		ImageFile imageFile = new ImageFile();
		imageFile.setContentType(contentType);
		imageFile.setFilename(filename);
		imageFile.setFileId(fileId);
		imageFile.setDataUrl(urlPrefix + fileId);
		
		jdbcTemplate.getJdbcOperations().execute(
			"insert into IMAGE_GALLERY_STANDALONE_FILES_T (FILE_ID, CONTENT_TYPE, CONTENT) VALUES (?, ?, ?)",
			new AbstractLobCreatingPreparedStatementCallback(this.lobHandler) {
				protected void setValues(PreparedStatement ps, LobCreator lobCreator) throws SQLException {
					ps.setString(1, fileId);
					ps.setString(2, contentType);
					try {
						lobCreator.setBlobAsBinaryStream(ps, 3, sourceImageFile.getInputStream(), (int)sourceImageFile.getSize());
					} catch (IOException e) {
						log.error("Error copying binary data from file " + filename, e);
					}
				}
			}
		);
		
		return imageFile;
	}
	
	@Transactional(readOnly = true)
	public void streamImage(final String fileId, final OutputStream contentStream) throws DataAccessException {
		jdbcTemplate.getJdbcOperations().query(
			"select CONTENT from IMAGE_GALLERY_STANDALONE_FILES_T where FILE_ID=?",
			new String[] {fileId},
			new AbstractLobStreamingResultSetExtractor() {
				@Override
				protected void streamData(ResultSet rs) throws SQLException, IOException, DataAccessException {
					InputStream inputStream = lobHandler.getBlobAsBinaryStream(rs, 1);
					if (inputStream != null) {
						FileCopyUtils.copy(inputStream, contentStream);
					}
				}
				
			}
		);
	}

	public String getUrlPrefix() {
		return urlPrefix;
	}

	public void setUrlPrefix(String urlPrefix) {
		this.urlPrefix = urlPrefix;
	}

	public void setContextService(ContextService contextService) {
		this.contextService = contextService;
	}
}
