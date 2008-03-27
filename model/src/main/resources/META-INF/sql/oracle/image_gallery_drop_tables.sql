-- Oracle
--
drop table IMAGE_GALLERY_IMAGE_T cascade constraints;

drop sequence IMAGE_GALLERY_IMAGE_S;

-- The trigger drop happens via the table cascade.
-- drop trigger IMAGE_GALLERY_IMAGE_TRIGGER;
