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
 * Audit trail of user actions, e.g. {@code view_species}.
 */
@Entity
@Table(name = "user_activity")
public class UserActivity {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	@Column(name = "action", nullable = false)
	private String action;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "species_id")
	private Species species;

	@CreationTimestamp
	@Column(name = "timestamp", nullable = false, updatable = false)
	private LocalDateTime timestamp;

	protected UserActivity() {
		// required by JPA
	}

	public UserActivity(User user, String action, Species species) {
		this.user = user;
		this.action = action;
		this.species = species;
	}

	public UUID getId() {
		return id;
	}

	public User getUser() {
		return user;
	}

	public String getAction() {
		return action;
	}

	public Species getSpecies() {
		return species;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}
}
