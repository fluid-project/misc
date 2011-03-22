Steps to get the image gallery to build on your machine
1) Check out the project sakai-master
2) From within the "master" subdirectory of the project sakai-master, run mvn clean install
3) Check out the project image-gallery2 as directory image-gallery.
4) Modify the COMPONENTS path in image-gallery/development-support/clean-build-run.sh to point to your infusion directory.
5) From image-gallery directory, run ./development-support/clean-build-run.sh
6) Navigate to http://localhost:8080/sakai-imagegallery2-web/site/AddImages/

The presence of this tool is temporary, it and all of its components will be removed from our repository space once a dedicated testing tool and server for the Uploader is ready.
