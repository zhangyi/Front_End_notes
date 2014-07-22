<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html"  media-type="text/html"  encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
<xsl:template match="/">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>xsl:when</title>
<style type="text/css">
ul,li{ padding:0 ; margin:0; list-style-type:none}
h1{ font-size:14px; font-weight:bold; text-align:center; display:none}
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
<xsl:template match="card" name="card">
<xsl:choose>
	<xsl:when test="contains(website/url,'http')">
	<li><a style="color:#000" class="url" href="{website/url}" title="{website/description}"><xsl:value-of select="website/url"/></a></li>
	</xsl:when>
	<xsl:when  test="contains(website/url,'www')">
	<li><a style="font-weight:bold" class="url" href="{website/url}" title="{website/description}"><xsl:value-of select="website/url"/></a></li>
	</xsl:when>
	
	


</xsl:choose>
</xsl:template>
</xsl:stylesheet>
