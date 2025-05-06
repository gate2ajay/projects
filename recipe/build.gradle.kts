plugins {
	kotlin("jvm") version "1.9.25"
	kotlin("plugin.spring") version "1.9.25"
	id("org.springframework.boot") version "3.4.2"
	id("io.spring.dependency-management") version "1.1.7"
	kotlin("plugin.jpa") version "1.9.25"
	kotlin("kapt") version "1.9.25" // Kotlin Annotation Processor 
}

group = "com.digitalnomads"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(19)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	val kotlin_version = "1.9.25"
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	runtimeOnly("org.postgresql:postgresql")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	//testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
	//implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version")
	annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
	kapt("org.springframework.boot:spring-boot-configuration-processor") 
	implementation("org.springdoc:springdoc-openapi-ui:1.6.15")

    // Kotlin plugin dependencies (allopen, noarg)

	implementation("org.jetbrains.kotlin:kotlin-maven-allopen:$kotlin_version")
    implementation("org.jetbrains.kotlin:kotlin-maven-noarg:$kotlin_version")

	constraints {
		implementation("org.jetbrains.kotlin:artifactId") {
			version {
				strictly("")
			}
		}
	}
}
configurations.all {
	resolutionStrategy {
		force("groupId:artifactId:version")
	}
}
kapt {
	correctErrorTypes = true
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict")
	}
}

sourceSets {
    main {
        java.srcDir("src/main/kotlin") // From build section
    }
    test {
        java.srcDir("src/test/kotlin") // From build section
    }
}

allOpen {
	annotation("jakarta.persistence.Entity")
	annotation("jakarta.persistence.MappedSuperclass")
	annotation("jakarta.persistence.Embeddable")
}

tasks.withType<Test> {
	useJUnitPlatform()
}

springBoot {
    // ... Spring Boot configurations if needed
}

