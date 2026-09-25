package com.natureearth.exception;

import java.util.Map;

/**
 * Business-rule violation. Maps to HTTP 400.
 */
public class BadRequestException extends RuntimeException {

	private final Map<String, String> details;

	public BadRequestException(String message) {
		this(message, Map.of());
	}

	public BadRequestException(String message, Map<String, String> details) {
		super(message);
		this.details = Map.copyOf(details);
	}

	public Map<String, String> getDetails() {
		return details;
	}
}
