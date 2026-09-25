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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Conservation profile. Only the fields up to {@code morphology} are exposed to
 * the STUDENT plan; the rest requires RESEARCHER.
 */
@Entity
@Table(name = "conservation")
public class Conservation {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "species_id", nullable = false, unique = true)
	private Species species;

	@Column(name = "conservation_status")
	private String conservationStatus;

	@Column(name = "habitat")
	private String habitat;

	@Column(name = "diet")
	private String diet;

	@Column(name = "morphology")
	private String morphology;

	@Column(name = "population_estimate")
	private Long populationEstimate;

	@Column(name = "threats")
	private String threats;

	@Column(name = "care_wild")
	private String careWild;

	@Column(name = "care_captivity")
	private String careCaptivity;

	@CreationTimestamp
	@Column(name = "fetched_at", nullable = false, updatable = false)
	private LocalDateTime fetchedAt;

	protected Conservation() {
		// required by JPA
	}

	public UUID getId() {
		return id;
	}

	public Species getSpecies() {
		return species;
	}

	public String getConservationStatus() {
		return conservationStatus;
	}

	public String getHabitat() {
		return habitat;
	}

	public String getDiet() {
		return diet;
	}

	public String getMorphology() {
		return morphology;
	}

	public Long getPopulationEstimate() {
		return populationEstimate;
	}

	public String getThreats() {
		return threats;
	}

	public String getCareWild() {
		return careWild;
	}

	public String getCareCaptivity() {
		return careCaptivity;
	}

	public LocalDateTime getFetchedAt() {
		return fetchedAt;
	}
}
