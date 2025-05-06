package com.digitalnomads.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "config")
data class ApplicationProperties(
    val internalServerError: String,
    val illegalArguments: String,
    val badRequest: String,
    val methodNotAllowed: String
)