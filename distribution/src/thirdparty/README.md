======================================================================
Third Party Packages
======================================================================

Introduction
------------

This archive contains the source code distributions, including any
source patches, for the third-party packages required to build Ice
on Linux and OS X.

Note: this archive does not contain third-party packages that Ice 
depends on but that are usually included on these systems, such as
bzip2 and OpenSSL. 

This document provides instructions for applying patches and for
configuring these third-party packages on each of the supported
platforms.

For more information about the third-party packaged in this archive, 
please refer to the links below:

Berkeley DB    http://www.oracle.com/us/products/database/berkeley-db/overview/index.htm
mcpp           http://mcpp.sourceforge.net


Table of Contents
-----------------

  1. Patches
     - mcpp
     - db
  2. Instructions for Linux
     - Berkeley DB
     - mcpp
  3. Instructions for OS X
     - Berkeley DB
     - mcpp


======================================================================
1. Patches
======================================================================

mcpp
----

The file mcpp/patch.mcpp.2.7.2 in this archive contains several
important fixes required by Ice. We expect that these changes will be
included in a future release of mcpp.

After extracting the mcpp source distribution, change to the top-level
directory and apply the patch as shown below:

  $ cd mcpp-2.7.2
  $ patch -p0 < ../mcpp/patch.mcpp.2.7.2

Follow the platform-specific instructions below for configuring and
building mcpp.


Berkeley DB
-----------

The file db/patch.db.5.3.28 in this archive contains several fixes
required to build Berkeley DB with Apple Clang & Java 8. This patch
is not needed if you use another C++ compiler.

After extracting the Berkeley DB source distribution, change to the
top-level directory and apply the patch as shown below:

  $ cd db-5.3.28.NC
  $ patch -p0 < ../db/patch.db.5.3.28

Follow the platform-specific instructions below for configuring and
building Berkeley DB.


======================================================================
2. Instructions for Linux
======================================================================

Berkeley DB
-----------

Berkeley DB must be configured with C++ support enabled. If you intend
to use Ice for Java with Berkeley DB, you must also enable Java
support:

  $ ../dist/configure --enable-cxx
  (plus --prefix=<dir> and/or --enable-java if you like)


mcpp
----

Ice requires the library version of mcpp, so configure mcpp as shown
below:

  $ ./configure CFLAGS=-fPIC --enable-mcpplib --disable-shared
  (and --prefix=<dir> if you like)

On 64-bit platforms, after installation it is necessary to rename the
library installation directory from $(prefix)/lib to $(prefix>/lib64.


======================================================================
3. Instructions for OS X
======================================================================

Berkeley DB
-----------

Berkeley DB must be configured with C++ support enabled.  If you
intend to use Ice for Java with Berkeley DB, you must also enable
Java support.

  $ export CXX=clang++
  $ ../dist/configure --enable-cxx --enable-static=no
  (plus --prefix=<dir> and/or --enable-java if you like)

For builds with support for both i386 and x86_64 architectures, use:

  $ export CXX=clang++
  $ export CFLAGS="-O3 -arch i386 -arch x86_64"
  $ export CXXFLAGS="-O3 -arch i386 -arch x86_64"
  $ ../dist/configure --enable-cxx --enable-static=no
  (plus --prefix=<dir> and/or --enable-java if you like)

To build Berkeley DB with C++11 support (--std=c++11 --stdlib=libc++),
add these flags to CXX (not CXXFLAGS).


mcpp
----

Ice requires the library version of mcpp, so configure mcpp as shown
below:

  $ export CFLAGS="-O3 -fno-common"
  $ ./configure --enable-mcpplib --disable-shared
  (and --prefix=<dir> if you like)

For builds with support for both i386 and x86_64 architectures, use:

  $ export CFLAGS="-O3 -fno-common -arch i386 -arch x86_64"
  $ ./configure --enable-mcpplib --disable-shared
  (and --prefix=<dir> if you like)