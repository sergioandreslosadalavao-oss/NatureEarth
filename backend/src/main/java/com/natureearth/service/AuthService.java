package com.natureearth.service;

import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.natureearth.dto.AuthResponse;
import com.natureearth.dto.auth.LoginRequest;
import com.natureearth.dto.auth.RegisterRequest;
import com.natureearth.entity.User;
import com.natureearth.exception.ConflictException;
import com.natureearth.exception.UnauthorizedException;
import com.natureearth.repository.UserRepository;
import com.natureearth.security.JwtService;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@Transactional
	public AuthResponse register(RegisterRequest request) {
		String email = normalizeEmail(request.email());
		if (userRepository.existsByEmailIgnoreCase(email)) {
			throw new ConflictException("Email is already registered",
					java.util.Map.of("email", "Email is already registered"));
		}

		User user = new User(
				request.name().trim(),
				email,
				passwordEncoder.encode(request.password()));

		try {
			userRepository.saveAndFlush(user);
		}
		catch (DataIntegrityViolationException ex) {
			// Lost the race against a concurrent registration on the UNIQUE index.
			throw new ConflictException("Email is already registered",
					java.util.Map.of("email", "Email is already registered"));
		}

		return AuthResponse.of(jwtService.generateToken(user), user);
	}

	@Transactional(readOnly = true)
	public AuthResponse login(LoginRequest request) {
		String email = normalizeEmail(request.email());
		User user = userRepository.findByEmailIgnoreCase(email)
				.orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new UnauthorizedException("Invalid email or password");
		}

		return AuthResponse.of(jwtService.generateToken(user), user);
	}

	private String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
	}
}
