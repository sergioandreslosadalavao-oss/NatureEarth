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
 * Scientific literature attached to a species. Reserved for the RESEARCHER plan.
 */
@Entity
@Table(name = "papers")
public class Paper {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "species_id", nullable = false)
	private Species species;

	@Column(name = "title", nullable = false)
	private String title;

	@Column(name = "authors")
	private String authors;

	@Column(name = "year")
	private Integer year;

	@Column(name = "doi")
	private String doi;

	@Column(name = "url")
	private String url;

	@CreationTimestamp
	@Column(name = "fetched_at", nullable = false, updatable = false)
	private LocalDateTime fetchedAt;

	protected Paper() {
		// required by JPA
	}

	public UUID getId() {
		return id;
	}

	public Species getSpecies() {
		return species;
	}

	public String getTitle() {
		return title;
	}

	public String getAuthors() {
		return authors;
	}

	public Integer getYear() {
		return year;
	}

	public String getDoi() {
		return doi;
	}

	public String getUrl() {
		return url;
	}

	public LocalDateTime getFetchedAt() {
		return fetchedAt;
	}
}
