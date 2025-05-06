package com.digitalknowmads.mediamanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Import HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults; // Import withDefaults

@Configuration
@EnableWebSecurity // Enable Spring Security's web security support
public class SecurityConfig {

//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                // 1. Configure CORS: Use the global CORS configuration defined in the main class
//                .cors(withDefaults()) // Applies the bean configured with WebMvcConfigurer
//
//                // 2. Disable CSRF completely (Simpler approach for testing stateless APIs)
//                .csrf(AbstractHttpConfigurer::disable) // Use method reference to disable
//
//                // 3. Configure Authorization Rules - SIMPLIFIED FOR TESTING
//                .authorizeHttpRequests(authz -> authz
//                        // Allow ALL requests (including OPTIONS) to ALL paths without authentication
//                        .requestMatchers("/**").permitAll()
//                );
//        // No other rules needed for this test
//
//        return http.build();
//    }
}
