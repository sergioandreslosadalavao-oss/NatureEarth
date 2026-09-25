package com.natureearth.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.natureearth.entity.ChatHistory;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, UUID> {

	List<ChatHistory> findByUserIdOrderByCreatedAtAsc(UUID userId);
}
