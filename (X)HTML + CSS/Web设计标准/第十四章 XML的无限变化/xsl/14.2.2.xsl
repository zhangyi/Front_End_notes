<?xml version="1.0" encoding="utf-8"?>
<html xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xsl:version="1.0">
<head>
	<title>网站名片</title>
	<link href="css/vcard.css" rel="stylesheet" type="text/css" />
</head>
<body>
<h1>网站名片</h1>
<ul class="vcard">
	<li>站长昵称：<span class="fn"><xsl:value-of select="card/nickname"/></span></li>
	<li>
		<ul>
			<li>网站名称：<xsl:value-of select="card/website/name"/></li>
			<li>网站地址：<a class="url">
			<xsl:attribute name="href"><xsl:value-of select="card/website/url"/></xsl:attribute>
			<xsl:attribute name="title"><xsl:value-of select="card/website/description"/></xsl:attribute>
			<xsl:value-of select="card/website/url"/></a></li>
			<li>网站描述：<xsl:value-of select="card/website/description"/></li>
		</ul>
	</li>
	<li>电子邮箱：<a class="email">
<xsl:attribute name="href"><xsl:value-of select="card/email"/></xsl:attribute>
	<xsl:value-of select="card/email"/></a></li>
</ul></body>
</html>
