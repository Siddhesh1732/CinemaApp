package com.project.cinema.service;

import com.project.cinema.dto.CastMemberRequest;
import com.project.cinema.dto.CastMemberResponse;
import com.project.cinema.models.CastMember;
import com.project.cinema.repository.CastMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CastMemberService {

    private final CastMemberRepository castMemberRepository;

    // ── Helper: CastMember entity → CastMemberResponse DTO ────────────────
    private CastMemberResponse toResponse(CastMember castMember) {
        return CastMemberResponse.builder()
                .id(castMember.getId())
                .name(castMember.getName())
                .primaryRole(castMember.getPrimaryRole().name())
                .dateOfBirth(castMember.getDateOfBirth())
                .nationality(castMember.getNationality())
                .profilePictureUrl(castMember.getProfilePictureUrl())
                .biography(castMember.getBiography())
                .build();
    }

    // ── GET /api/cast-members ──────────────────────────────────────────────
    public Page<CastMemberResponse> getAllCastMembers(Pageable pageable) {
        return castMemberRepository.findAll(pageable)
                .map(this::toResponse);
    }

    // ── GET /api/cast-members/{id} ─────────────────────────────────────────
    public CastMemberResponse getCastMemberById(Long id) {
        CastMember castMember = castMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cast member not found with id: " + id));
        return toResponse(castMember);
    }

    // ── GET /api/cast-members/search?q=tom ────────────────────────────────
    public List<CastMemberResponse> searchCastMembers(String query) {
        return castMemberRepository.findByNameContainingIgnoreCase(query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── POST /api/cast-members (ADMIN) ─────────────────────────────────────
    public CastMemberResponse createCastMember(CastMemberRequest request) {
        CastMember castMember = CastMember.builder()
                .name(request.getName())
                .primaryRole(CastMember.CastRole.valueOf(request.getPrimaryRole()))
                .dateOfBirth(request.getDateOfBirth())
                .nationality(request.getNationality())
                .profilePictureUrl(request.getProfilePictureUrl())
                .biography(request.getBiography())
                .build();

        return toResponse(castMemberRepository.save(castMember));
    }

    // ── PUT /api/cast-members/{id} (ADMIN) ─────────────────────────────────
    public CastMemberResponse updateCastMember(Long id, CastMemberRequest request) {
        CastMember castMember = castMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cast member not found with id: " + id));

        if (request.getName() != null)              castMember.setName(request.getName());
        if (request.getPrimaryRole() != null)       castMember.setPrimaryRole(CastMember.CastRole.valueOf(request.getPrimaryRole()));
        if (request.getDateOfBirth() != null)       castMember.setDateOfBirth(request.getDateOfBirth());
        if (request.getNationality() != null)       castMember.setNationality(request.getNationality());
        if (request.getProfilePictureUrl() != null) castMember.setProfilePictureUrl(request.getProfilePictureUrl());
        if (request.getBiography() != null)         castMember.setBiography(request.getBiography());

        return toResponse(castMemberRepository.save(castMember));
    }

    // ── DELETE /api/cast-members/{id} (ADMIN) ──────────────────────────────
    public void deleteCastMember(Long id) {
        if (!castMemberRepository.existsById(id)) {
            throw new RuntimeException("Cast member not found with id: " + id);
        }
        castMemberRepository.deleteById(id);
    }
}
