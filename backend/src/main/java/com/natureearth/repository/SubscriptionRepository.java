package com.natureearth.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.natureearth.entity.Subscription;
import com.natureearth.entity.SubscriptionStatus;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

	Optional<Subscription> findFirstByUserIdAndStatus(UUID userId, SubscriptionStatus status);

	List<Subscription> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
