package com.example.mediamanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MediaManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediaManagerApplication.class, args);
    }

    // Optional: Add CORS configuration globally if preferred over @CrossOrigin
    /*
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Apply to your API path pattern
                        .allowedOrigins("http://localhost:4200") // Allow Angular dev server
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false); // Adjust if credentials needed
            }
        };
    }
    */

}

