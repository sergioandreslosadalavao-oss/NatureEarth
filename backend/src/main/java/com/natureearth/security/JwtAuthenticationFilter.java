package com.natureearth.security;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.natureearth.entity.User;
import com.natureearth.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Reads {@code Authorization: Bearer <token>}, resolves the user and puts it in
 * the SecurityContext.
 * <p>
 * A bad token never fails the request here: the security chain decides whether
 * the endpoint actually requires authentication. That keeps public endpoints
 * usable with a stale token while still protecting the rest.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
	private static final String HEADER = "Authorization";
	private static final String PREFIX = "Bearer ";

	private final JwtService jwtService;
	private final UserRepository userRepository;

	public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {

		extractToken(request)
				.flatMap(this::resolveUser)
				.ifPresent(user -> authenticate(user, request));

		filterChain.doFilter(request, response);
	}

	private Optional<String> extractToken(HttpServletRequest request) {
		String header = request.getHeader(HEADER);
		if (header == null || !header.startsWith(PREFIX)) {
			return Optional.empty();
		}
		String token = header.substring(PREFIX.length()).trim();
		return token.isEmpty() ? Optional.empty() : Optional.of(token);
	}

	private Optional<User> resolveUser(String token) {
		String subject = jwtService.extractUserId(token);
		if (subject == null) {
			log.debug("Rejected request: invalid or expired JWT");
			return Optional.empty();
		}
		try {
			UUID userId = UUID.fromString(subject);
			return userRepository.findById(userId);
		}
		catch (IllegalArgumentException ex) {
			log.debug("Rejected request: malformed JWT subject");
			return Optional.empty();
		}
	}

	private void authenticate(User user, HttpServletRequest request) {
		AuthenticatedUser principal = new AuthenticatedUser(user);
		var authentication = new UsernamePasswordAuthenticationToken(
				principal, null, principal.getAuthorities());
		authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
		SecurityContextHolder.getContext().setAuthentication(authentication);
	}
}
