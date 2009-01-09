REPO=`pwd`/..
COMPONENTS=$REPO/components
GALLERY=$REPO/image-gallery

# Delete the sticky fluid-components directory from image-gallery first.
cd $GALLERY/web/src/main/webapp/
rm -rf fluid-components

# Build fluid-components
cd $COMPONENTS
mvn clean install

# Build image-gallery
cd $GALLERY
mvn clean install sakai:deploy -Dmaven.tomcat.home=.

# Run the app
cd $GALLERY/web
mvn clean install war:inplace jetty:run
