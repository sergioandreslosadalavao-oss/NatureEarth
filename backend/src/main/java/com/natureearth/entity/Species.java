package com.natureearth.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "species")
public class Species {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(name = "scientific_name", nullable = false, unique = true)
	private String scientificName;

	@Column(name = "common_name_es")
	private String commonNameEs;

	@Column(name = "common_name_en")
	private String commonNameEn;

	@Column(name = "category")
	private String category;

	@Column(name = "image_url")
	private String imageUrl;

	@Column(name = "observations_count")
	private Integer observationsCount = 0;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	/**
	 * pgvector column used by the semantic-search feature. It is not writable
	 * through JPA, so it is mapped read-only and left out of INSERT/UPDATE.
	 */
	@Column(name = "name_embedding", columnDefinition = "vector(384)", insertable = false, updatable = false)
	private String nameEmbedding;

	protected Species() {
		// required by JPA
	}

	public UUID getId() {
		return id;
	}

	public String getScientificName() {
		return scientificName;
	}

	public void setScientificName(String scientificName) {
		this.scientificName = scientificName;
	}

	public String getCommonNameEs() {
		return commonNameEs;
	}

	public void setCommonNameEs(String commonNameEs) {
		this.commonNameEs = commonNameEs;
	}

	public String getCommonNameEn() {
		return commonNameEn;
	}

	public void setCommonNameEn(String commonNameEn) {
		this.commonNameEn = commonNameEn;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public Integer getObservationsCount() {
		return observationsCount;
	}

	public void setObservationsCount(Integer observationsCount) {
		this.observationsCount = observationsCount;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public String getNameEmbedding() {
		return nameEmbedding;
	}
}
