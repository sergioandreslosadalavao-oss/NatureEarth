package com.natureearth.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.natureearth.entity.UserActivity;

public interface UserActivityRepository extends JpaRepository<UserActivity, UUID> {

	List<UserActivity> findByUserIdOrderByTimestampDesc(UUID userId);
}
