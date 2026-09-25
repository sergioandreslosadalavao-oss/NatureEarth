package com.natureearth.exception;

import java.util.Map;

/**
 * Uniqueness violation. Maps to HTTP 409.
 */
public class ConflictException extends RuntimeException {

	private final Map<String, String> details;

	public ConflictException(String message) {
		this(message, Map.of());
	}

	public ConflictException(String message, Map<String, String> details) {
		super(message);
		this.details = Map.copyOf(details);
	}

	public Map<String, String> getDetails() {
		return details;
	}
}
