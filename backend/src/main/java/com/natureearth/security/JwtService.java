package com.natureearth.security;

import java.time.Duration;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.natureearth.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

/**
 * Issues and validates the HS512 access tokens.
 * <p>
 * Only the user id is stored in the subject. The plan is deliberately NOT baked
 * into the token: the filter re-reads it from the database on every request, so
 * an upgrade takes effect immediately instead of waiting for token expiry.
 */
@Service
public class JwtService {

	private static final String CLAIM_ROLE = "role";

	private final SecretKey signingKey;
	private final Duration expiration;

	public JwtService(
			@Value("${app.jwt.secret}") String secret,
			@Value("${app.jwt.expiration-ms}") long expirationMs) {
		this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret.trim()));
		if (this.signingKey.getEncoded().length < 32) {
			throw new IllegalStateException("app.jwt.secret must decode to at least 32 bytes for HS256+");
		}
		this.expiration = Duration.ofMillis(expirationMs);
	}

	public String generateToken(User user) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + expiration.toMillis());
		return Jwts.builder()
				.subject(user.getId().toString())
				.claim(CLAIM_ROLE, user.getRole().name())
				.issuedAt(now)
				.expiration(expiry)
				.signWith(signingKey)
				.compact();
	}

	/**
	 * @return the user id encoded in the token, or null when the token is
	 *         malformed, tampered with, or expired.
	 */
	public String extractUserId(String token) {
		try {
			Claims claims = Jwts.parser()
					.verifyWith(signingKey)
					.build()
					.parseSignedClaims(token)
					.getPayload();
			return claims.getSubject();
		}
		catch (JwtException | IllegalArgumentException ex) {
			return null;
		}
	}
}
