package com.natureearth.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
		@NotBlank(message = "name is required")
		@Size(max = 255, message = "name must not exceed 255 characters")
		String name,

		@NotBlank(message = "email is required")
		@Email(message = "email must be a valid address")
		@Size(max = 255, message = "email must not exceed 255 characters")
		String email,

		@NotBlank(message = "password is required")
		@Size(min = 6, message = "password must be at least 6 characters")
		String password) {
}
