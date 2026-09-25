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
 * Citation for a specific species field, so every fact can be traced back to a source.
 */
@Entity
@Table(name = "species_sources")
public class SpeciesSource {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "species_id", nullable = false)
	private Species species;

	@Column(name = "field_name", nullable = false)
	private String fieldName;

	@Column(name = "source_name", nullable = false)
	private String sourceName;

	@Column(name = "reference")
	private String reference;

	@CreationTimestamp
	@Column(name = "fetched_at", nullable = false, updatable = false)
	private LocalDateTime fetchedAt;

	protected SpeciesSource() {
		// required by JPA
	}

	public UUID getId() {
		return id;
	}

	public Species getSpecies() {
		return species;
	}

	public String getFieldName() {
		return fieldName;
	}

	public String getSourceName() {
		return sourceName;
	}

	public String getReference() {
		return reference;
	}

	public LocalDateTime getFetchedAt() {
		return fetchedAt;
	}
}
