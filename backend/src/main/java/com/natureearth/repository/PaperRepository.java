package com.natureearth.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.natureearth.entity.Paper;

public interface PaperRepository extends JpaRepository<Paper, UUID> {

	List<Paper> findBySpeciesIdOrderByYearDesc(UUID speciesId);
}
