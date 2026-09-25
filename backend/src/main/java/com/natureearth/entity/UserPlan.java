package com.natureearth.entity;

/**
 * Maps the PostgreSQL {@code user_plan} enum type. The ordinal position of each
 * constant defines the visibility tier, so CASUAL must remain first.
 */
public enum UserPlan {
	CASUAL,
	STUDENT,
	RESEARCHER;

	/**
	 * @return true when this plan is at least as detailed as {@code required}.
	 */
	public boolean includes(UserPlan required) {
		return ordinal() >= required.ordinal();
	}
}
