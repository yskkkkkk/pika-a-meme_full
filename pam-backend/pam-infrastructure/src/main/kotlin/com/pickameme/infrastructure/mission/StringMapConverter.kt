package com.pickameme.infrastructure.mission

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter
class StringMapConverter : AttributeConverter<Map<String, String>, String> {
    private val mapper = jacksonObjectMapper()

    override fun convertToDatabaseColumn(attribute: Map<String, String>?): String =
        if (attribute.isNullOrEmpty()) "{}" else mapper.writeValueAsString(attribute)

    override fun convertToEntityAttribute(dbData: String?): Map<String, String> =
        if (dbData.isNullOrBlank() || dbData == "{}") emptyMap()
        else mapper.readValue(dbData)
}
