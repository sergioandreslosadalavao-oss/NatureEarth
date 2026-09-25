package com.natureearth.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Persisted exchange of the species assistant.
 */
@Entity
@Table(name = "chat_history")
public class ChatHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	@Column(name = "message", nullable = false)
	private String message;

	@Column(name = "response", nullable = false)
	private String response;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	protected ChatHistory() {
		// required by JPA
	}

	public ChatHistory(User user, String message, String response) {
		this.user = user;
		this.message = message;
		this.response = response;
	}

	public UUID getId() {
		return id;
	}

	public User getUser() {
		return user;
	}

	public String getMessage() {
		return message;
	}

	public String getResponse() {
		return response;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
