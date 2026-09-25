package com.natureearth.exception;

/**
 * Authentication failure. Maps to HTTP 401.
 */
public class UnauthorizedException extends RuntimeException {

	public UnauthorizedException(String message) {
		super(message);
	}
}
