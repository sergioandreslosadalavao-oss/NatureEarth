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
 * Linnaean classification. Reserved for the RESEARCHER plan.
 * {@code class} and {@code order_name} are SQL keywords, hence the explicit
 * column mapping and the {@code className} / {@code orderName} field names.
 */
@Entity
@Table(name = "taxonomy")
public class Taxonomy {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "species_id", nullable = false, unique = true)
	private Species species;

	@Column(name = "kingdom")
	private String kingdom;

	@Column(name = "phylum")
	private String phylum;

	@Column(name = "class")
	private String className;

	@Column(name = "order_name")
	private String orderName;

	@Column(name = "family")
	private String family;

	@Column(name = "genus")
	private String genus;

	@Column(name = "ncbi_taxon_id")
	private Long ncbiTaxonId;

	@CreationTimestamp
	@Column(name = "fetched_at", nullable = false, updatable = false)
	private LocalDateTime fetchedAt;

	protected Taxonomy() {
		// required by JPA
	}

	public UUID getId() {
		return id;
	}

	public Species getSpecies() {
		return species;
	}

	public String getKingdom() {
		return kingdom;
	}

	public String getPhylum() {
		return phylum;
	}

	public String getClassName() {
		return className;
	}

	public String getOrderName() {
		return orderName;
	}

	public String getFamily() {
		return family;
	}

	public String getGenus() {
		return genus;
	}

	public Long getNcbiTaxonId() {
		return ncbiTaxonId;
	}

	public LocalDateTime getFetchedAt() {
		return fetchedAt;
	}
}
