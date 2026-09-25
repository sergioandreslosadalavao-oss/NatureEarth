package com.natureearth.dto;

import java.util.UUID;

import com.natureearth.entity.UserPlan;
import com.natureearth.entity.UserRole;

/**
 * Public view of a user. Never carries the password hash.
 */
public record UserResponse(
		UUID id,
		String name,
		String email,
		UserRole role,
		UserPlan plan) {
}
