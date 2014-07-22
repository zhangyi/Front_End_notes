<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="card" name="card">

<li>
<ul class="vcard">
	<li>站长昵称:<span class="fn"><xsl:value-of select="nickname"/></span></li>
	<li>
		<ul>
			<li>网站名称：<xsl:value-of select="website/name"/></li>
			<li>网站址址：<a class="url" href="{website/url}" title="{website/description}"><xsl:value-of select="website/url"/></a></li>
			<li>网站描述：<xsl:choose><xsl:when test="string-length(website/description)>13"><xsl:value-of select="substring(website/description,1,12)"/><xsl:text>...</xsl:text></xsl:when>
			<xsl:when test="string-length(website/description)&lt;=13 "><xsl:value-of select="website/description"/></xsl:when>
			</xsl:choose>
			</li>
		</ul>
	</li>
	<xsl:if test="email!=''">
	<li>电子邮箱：<a class="email" href="mailto:{email}"><xsl:value-of select="email"/></a></li>
	</xsl:if>
</ul>
</li>
</xsl:template>
</xsl:stylesheet>
