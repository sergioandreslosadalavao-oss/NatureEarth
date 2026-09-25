package com.natureearth.security;

import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.natureearth.entity.User;
import com.natureearth.entity.UserPlan;
import com.natureearth.entity.UserRole;

/**
 * Authenticated principal.
 * <p>
 * It carries the current plan instead of a role-only snapshot, so a plan upgrade
 * takes effect on the very next request without forcing the client to re-login.
 */
public class AuthenticatedUser implements UserDetails {

	private final UUID id;
	private final String email;
	private final String name;
	private final String passwordHash;
	private final UserRole role;
	private final UserPlan plan;

	public AuthenticatedUser(User user) {
		this.id = user.getId();
		this.email = user.getEmail();
		this.name = user.getName();
		this.passwordHash = user.getPasswordHash();
		this.role = user.getRole();
		this.plan = user.getPlan();
	}

	public UUID getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public UserRole getRole() {
		return role;
	}

	public UserPlan getPlan() {
		return plan;
	}

	@Override
	public java.util.Collection<? extends GrantedAuthority> getAuthorities() {
		return java.util.List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
	}

	@Override
	public String getPassword() {
		return passwordHash;
	}

	@Override
	public String getUsername() {
		return email;
	}
}
