<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:dc="http://purl.org/dc/elements/1.1/"  >
<xsl:output method="html"  media-type="text/html"  encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>

<xsl:template match="/" >
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CH" lang="zh-CH">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title><xsl:value-of select="rss/channel/title"/> - 网站更新</title>
<link rel="stylesheet" href="css/rss.css" type="text/css" media="all" />
</head>
<body>
<div id="wrapper">
	<div id="header">
	<h1><a href="{rss/channel/link}" title="{rss/channel/description}">
	<xsl:value-of select="rss/channel/title" /></a>  网站更新</h1>
	<div>
		<p>你可以通过直接添加到你的在线Feed阅读器。</p>
	</div>
	</div>
	<div id="content">
	<ol>
		<xsl:apply-templates select="rss/channel/item" >
		
		</xsl:apply-templates>
	</ol>
	</div>
	<div id="footer">
	</div>
</div>
</body>
</html>
</xsl:template>
<xsl:template match="item">
	<xsl:choose>
		<xsl:when test="category='Lab'">
		<li class="vlog itemLab">
	
			<h2><a href="{link}"><xsl:value-of select="title" /></a></h2>
			<ul class="other">
				<li>分类：<xsl:value-of select="category" /></li>
				<li>日期：<xsl:value-of select="pubDate" /></li>
			</ul>
			<p class="description"><xsl:value-of select="description" /></p>
		</li>	</xsl:when>	
		<xsl:otherwise>
		<li class="vlog">
	
			<h2><a href="{link}"><xsl:value-of select="title" /></a></h2>
			<ul class="other">
				<li>分类：<xsl:value-of select="category" /></li>
				<li>日期：<xsl:value-of select="pubDate" /></li>
			</ul>
			<p class="description"><xsl:value-of select="description" /></p>
		</li>
		</xsl:otherwise>
	</xsl:choose>
		
</xsl:template>
</xsl:stylesheet>
