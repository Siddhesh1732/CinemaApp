package com.project.cinema.repository;

import com.project.cinema.models.CastMember;
import com.project.cinema.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CastMemberRepository extends JpaRepository<CastMember, Long> {
    List<CastMember> findByNameContainingIgnoreCase(String name);
}
