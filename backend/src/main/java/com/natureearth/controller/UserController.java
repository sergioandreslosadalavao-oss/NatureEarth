package com.natureearth.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.natureearth.dto.UserResponse;
import com.natureearth.dto.auth.UpgradeRequest;
import com.natureearth.security.AuthenticatedUser;
import com.natureearth.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/me")
	public UserResponse me(@AuthenticationPrincipal AuthenticatedUser principal) {
		return userService.profile(principal.getId());
	}

	/**
	 * Activates a paid plan. The JWT subject never changes, so the existing
	 * token immediately resolves to the new plan on the next request.
	 */
	@PostMapping("/upgrade")
	public UserResponse upgrade(@AuthenticationPrincipal AuthenticatedUser principal,
			@Valid @RequestBody UpgradeRequest request) {

		return userService.upgrade(principal.getId(), request.plan());
	}
}
