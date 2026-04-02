package com.hotel.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    // MongoDB connection is auto-configured via application.properties
    // Add custom MongoDB configurations here as needed
    // e.g., custom converters, MongoTemplate customizations, etc.

}
