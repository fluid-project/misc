-- hsqldb
--
CREATE TABLE IMAGE_GALLERY_STANDALONE_FILES_T (
	FILE_ID varchar(255) not null,
	CONTENT_TYPE varchar(255) not null,
	CONTENT longvarbinary,
	primary key (FILE_ID)
);
