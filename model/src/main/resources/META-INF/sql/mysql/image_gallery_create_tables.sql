-- MySQL
--
create table IMAGE_GALLERY_IMAGE_T (
	ID bigint not null auto_increment,
	CONTEXT varchar(255) not null,
	TITLE varchar(255) NOT NULL default '',
	FILE_ID varchar(255),
	DESCRIPTION text,
	primary key (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
