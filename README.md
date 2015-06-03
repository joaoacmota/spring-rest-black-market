# spring-rest-black-market

![Build status](https://travis-ci.org/vtsukur/spring-rest-black-market.svg?branch=master)

## Building and Running

Make sure that [Java 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) is installed and is on the path.

Project uses [Gradle](http://gradle.org/) as a build tool. Building is as easy as running the following shell command on Linux / Unix systems:

    ./gradlew build

This is the respective shell command to run Windows:

    gradlew build

Once the application is built, run it as follows:

    java -jar build/libs/spring-rest-black-market.jar

Navigate to [http://localhost:8080](http://localhost:8080) and surf through the black market ;)

## Development

### IntelliJ IDEA

Recommended version of the IDE is 14+

Generate IDE files by running the following shell command on Linux / Unix systems:

    ./gradlew idea

This is the respective shell command to run Windows:

    gradlew idea

Alternatively, just import the `build.gradle` from the IDE itself using *File -> Open ...*

Make sure that *Annotation Processors* are enabled and received from the project classpath
(for IntelliJ IDEA 14 this is activated in
*Preferences* screen under *Build, Execution, Deployment -> Compiler -> Annotation Processors*
path where *Enable annotation processing* must be checked and
*Obtain processors from project classpath* option must be selected).
This is utterly important for the project to compile.