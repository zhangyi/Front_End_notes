<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template name="formatDate">
	<xsl:param name="date" />
	<xsl:param name="dateMonth" select="substring(substring-after(substring-after($date, ', '), ' '), 1, 3)" />
	<!--<xsl:param name="sMonthNames" select="'JanFebMarAprMayJunJulAugSepOctNovDec'"/> 
	<xsl:value-of select="string-length(substring-before($sMonthNames, substring(substring-after(substring-after($date, ', '), ' '), 1, 3))) div 3 +1" />-->
	<xsl:value-of select="substring(substring-after(substring-after(substring-after($date,' '),' '),' '),1,4)" />
	<xsl:text>年</xsl:text>
	<xsl:choose>
	<xsl:when test="$dateMonth='Jan'">1</xsl:when>
	<xsl:when test="$dateMonth='Feb'">2</xsl:when>
	<xsl:when test="$dateMonth='Mar'">3</xsl:when>
	<xsl:when test="$dateMonth='Apr'">4</xsl:when>
	<xsl:when test="$dateMonth='May'">5</xsl:when>
	<xsl:when test="$dateMonth='Jun'">6</xsl:when>
	<xsl:when test="$dateMonth='Jul'">7</xsl:when>
	<xsl:when test="$dateMonth='Aug'">8</xsl:when>
	<xsl:when test="$dateMonth='Sep'">9</xsl:when>
	<xsl:when test="$dateMonth='Oct'">10</xsl:when>
	<xsl:when test="$dateMonth='Nov'">11</xsl:when>
	<xsl:when test="$dateMonth='Dec'">12</xsl:when>
	<xsl:otherwise>?</xsl:otherwise>
	</xsl:choose>
	<xsl:text>月</xsl:text>
	<xsl:value-of select="number(substring(substring-after(pubDate,', '), 1, 2))" />
	<xsl:text>日</xsl:text>
</xsl:template>
</xsl:stylesheet>
