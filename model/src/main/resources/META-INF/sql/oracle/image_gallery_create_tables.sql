-- Oracle
--
SET SQLTERMINATOR OFF

create table IMAGE_GALLERY_IMAGE_T (
	ID number(19,0) not null,
	CONTEXT varchar2(255) not null,
	TITLE varchar2(255) not null,
	FILE_ID varchar2(255),
	DESCRIPTION clob,
	primary key (ID))
/
create sequence IMAGE_GALLERY_IMAGE_S
/

create or replace trigger IMAGE_GALLERY_IMAGE_TRIGGER
	before insert on IMAGE_GALLERY_IMAGE_T
	for each row when (NEW.ID is null)
begin
	select IMAGE_GALLERY_IMAGE_S.NEXTVAL into :NEW.ID from dual;
end;
/
