package com.nexusai.platform;

import com.fasterxml.jackson.databind.ObjectMapper; // 👈 BU EKLENECEK
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean; // 👈 BU EKLENECEK

@SpringBootApplication
@EnableFeignClients
public class PlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlatformApplication.class, args);
	}

	// 👇 İŞTE KURTARICI PARÇA BU 👇
	// Spring Boot'a diyoruz ki: "Eğer birisi senden ObjectMapper isterse, bunu ver."
	@Bean
	public ObjectMapper objectMapper() {
		return new ObjectMapper();
	}
}