<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html"  media-type="text/html"  encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
<xsl:include href="card-14.2.4-7-i.xsl" />
<xsl:template match="/">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CH">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title><xsl:value-of select="club/title"/></title>
<style type="text/css">
ul,li{ padding:0 ; margin:0; list-style-type:none}
.vcard{
	display:block;
	width:22em;
	margin:10px;
	padding:10px;
	border:2px #999 solid;
	font:85%/1.6em Verdana, Arial, Helvetica, sans-serif;
}
</style>
</head>
<body>

<ul>
<xsl:apply-templates select="club/card" />
</ul>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
