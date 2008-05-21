SETTING UP DEVELOPMENT ENVIRONMENT

To build and run the standalone Image Gallery project, all that's currently
needed from Sakai trunk is a recent build of the "master" project. Still, it
won't do any harm to keep a copy of the entire trunk up to date -- you don't
have to build it or import it into Eclipse.

====

BUILDING AND RUNNING THE APPLICATION

To build the complete application, test business logic, and
deploy a copy of the application to your Tomcat server, start
from the top "image-gallery" folder:

image-gallery> mvn clean install sakai:deploy

While developing the web UI, the recommended next step is:

image-gallery> cd web
web> mvn war:inplace jetty:run

This will start a lightweight web server which runs the application
from your source code (rather than creating and copying a WAR file
to a central location). To test, point your browser to:

http://localhost:8080/sakai-imagegallery2-web/

You can use any editor or IDE to change any source files in or below
the "web" directory. If you need to stop the server and start again fresh,
just CTRL-C in the command shell window and replay "mvn -o jetty:run".
You shouldn't need to do a full build again until business logic or
project dependencies change.

WARNING: As a side-effect of "mvn war:inplace jetty:run", the contents
of the Fluid Components WAR will be expanded and copied into your
checked-out working copy of the source. Make sure you don't accidentally
commit those files to Subversion! If you want to play it safe, instead use the
command "mvn jetty:run-war". That approach will not automatically pick up
changes as you edit the source code, but it will still be quicker than
using Tomcat. (See http://jira.codehaus.org/browse/JETTY-241 for details.)

====

DEBUGGING THE APPLICATION FROM ECLIPSE

1. Find the "mvn" or "mvn.bat" script being used.
2. Copy the "mvn" script to a script "mvnd".
3. Add to top of mvnd:

MAVEN_OPTS="$MAVEN_OPTS -Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=8000,server=y,suspend=n"
export MAVEN_OPTS

4. In Eclipse, "Open Debug Dialog" to set up a "Remote Java Application"
configuration for your project.
5. Start the Maven Jetty plugin using your new script:

web> mvnd jetty:run-war
or
web> mvn war:inplace jetty:run

6. In Eclipse, set any desired breakpoints and then select your application
debug configuration from the debugger menu item.

====

CHANGING THE DATABASE

By default, the application and test code uses an in-memory hsqldb database.
To run against MySQL instead, set an environment variable named
"STANDALONE_PROPERTIES" to point to a file containing sakai.properties settings:

web> export STANDALONE_PROPERTIES="C:/java/sakaisettings/mysql-sakai/sakai.properties"
web> mvn -o jetty:run-war

====

SAKAI INTEGRATION

Although started with the intention of creating a Sakai tool, time and
personnel constraints led to this project being redirected towards
a basic sample client for the Fluid multi-file uploader component.
The Sakai integration code as of the switch can be found in the "sakai"
directory, but hasn't been tested in some time.

===

Ray Davis - 2008-05-19
