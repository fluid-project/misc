REPO=`pwd`/..
COMPONENTS=$REPO/infusion
GALLERY=$REPO/image-gallery

# Delete the sticky Infusion directories from image-gallery first.
cd $GALLERY/web/src/main/webapp/
rm -rf components
rm -rf framework
rm -rf integration-demos
rm -rf lib
rm -rf sample-code
rm -rf standalone-demos
rm -rf tests 

# Build Infusion 
cd $COMPONENTS
mvn clean install

# Build image-gallery
cd $GALLERY
mvn clean install sakai:deploy -Dmaven.tomcat.home=.

# Run the app
cd $GALLERY/web
mvn clean install war:inplace jetty:run
