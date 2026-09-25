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
 * Occurrence point used to plot the 3D globe.
 * <p>
 * {@code geom} is a PostGIS {@code geography(Point,4326)} column. JPA has no
 * portable mapping for it, so it is stored read-only and coordinates are always
 * extracted in SQL with {@code ST_X}/{@code ST_Y}.
 */
@Entity
@Table(name = "species_locations")
public class SpeciesLocation {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "species_id", nullable = false)
	private Species species;

	@Column(name = "place_name")
	private String placeName;

	@Column(name = "geom", columnDefinition = "geography(Point,4326)", insertable = false, updatable = false)
	private String geom;

	@Column(name = "is_default")
	private Boolean isDefault = Boolean.FALSE;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	protected SpeciesLocation() {
		// required by JPA
	}

	public UUID getId() {
		return id;
	}

	public Species getSpecies() {
		return species;
	}

	public String getPlaceName() {
		return placeName;
	}

	public String getGeom() {
		return geom;
	}

	public Boolean getIsDefault() {
		return isDefault;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
