%{

// **********************************************************************
//
// Copyright (c) 2002
// ZeroC, Inc.
// Billerica, MA, USA
//
// All Rights Reserved.
//
// Ice is free software; you can redistribute it and/or modify it under
// the terms of the GNU General Public License version 2 as published by
// the Free Software Foundation.
//
// **********************************************************************

#include <Ice/Ice.h>
#include <IceStorm/Parser.h>

#ifdef _WIN32
// I get these warnings from some bison versions:
// warning C4102: 'yyoverflowlab' : unreferenced label
#   pragma warning( disable : 4102 )
// warning C4065: switch statement contains 'default' but no 'case' labels
#   pragma warning( disable : 4065 )
#endif

using namespace std;
using namespace Ice;
using namespace IceStorm;

void
yyerror(const char* s)
{
    parser->error(s);
}

%}

%pure_parser

%token ICE_STORM_HELP
%token ICE_STORM_EXIT
%token ICE_STORM_CREATE
%token ICE_STORM_DESTROY
%token ICE_STORM_LIST
%token ICE_STORM_SHUTDOWN
%token ICE_STORM_LINK
%token ICE_STORM_UNLINK
%token ICE_STORM_GRAPH
%token ICE_STORM_STRING

%%

// ----------------------------------------------------------------------
start
// ----------------------------------------------------------------------
: commands
{
}
|
{
}
;

// ----------------------------------------------------------------------
commands
// ----------------------------------------------------------------------
: commands command
{
}
| command
{
}
;

// ----------------------------------------------------------------------
command
// ----------------------------------------------------------------------
: ICE_STORM_HELP ';'
{
    parser->usage();
}
| ICE_STORM_EXIT ';'
{
    return 0;
}
| ICE_STORM_CREATE strings ';'
{
    parser->create($2);
}
| ICE_STORM_DESTROY strings ';'
{
    parser->destroy($2);
}
| ICE_STORM_LINK strings ';'
{
    parser->link($2);
}
| ICE_STORM_UNLINK strings ';'
{
    parser->unlink($2);
}
| ICE_STORM_GRAPH strings ';'
{
    parser->graph($2);
}
| ICE_STORM_LIST ';'
{
    std::list<std::string> args;
    parser->dolist(args);
}
| ICE_STORM_LIST strings ';'
{
    parser->dolist($2);
}
| ICE_STORM_SHUTDOWN ';'
{
    parser->shutdown();
}
| error ';'
{
    yyerrok;
}
| ';'
{
}
;

// ----------------------------------------------------------------------
strings
// ----------------------------------------------------------------------
: ICE_STORM_STRING strings
{
    $$ = $2;
    $$.push_front($1.front());
}
| ICE_STORM_STRING
{
    $$ = $1;
}
;

%%
