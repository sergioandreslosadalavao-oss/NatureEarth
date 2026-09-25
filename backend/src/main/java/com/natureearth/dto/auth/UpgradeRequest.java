package com.natureearth.dto.auth;

import com.natureearth.entity.UserPlan;

import jakarta.validation.constraints.NotNull;

/**
 * Upgrade payload. CASUAL is rejected by the service: it is the free default
 * tier, not a purchasable plan.
 */
public record UpgradeRequest(
		@NotNull(message = "plan is required") UserPlan plan) {
}
