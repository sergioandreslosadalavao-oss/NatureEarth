package com.natureearth.dto;

import com.natureearth.entity.User;

/**
 * Login/register response: {@code {token, user: {id, name, email, role, plan}}}.
 * The user payload never carries the password hash.
 */
public record AuthResponse(
		String token,
		UserResponse user) {

	public static AuthResponse of(String token, User user) {
		UserResponse payload = new UserResponse(
				user.getId(),
				user.getName(),
				user.getEmail(),
				user.getRole(),
				user.getPlan());
		return new AuthResponse(token, payload);
	}
}
